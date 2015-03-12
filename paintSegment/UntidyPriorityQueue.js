// This is a port of the UntidyPriorityQueue/PseudoPriorityQueue as written by Jerome Piovano.
// http://www-sop.inria.fr/members/Jerome.Piovano/LevelSet/classlevelset_1_1PriorityQueue.html

function UntidyPriorityQueue(_size, _inc_max) {
	this.m_tab = new Array(_size);
	for (var i=0; i < _size; i++) {
		this.m_tab[i] = [];
	}
	this.m_size = _size;
	this.m_nb_elem = 0;
	this.m_t0 = 0;
	this.m_i0 = 0;
	this.m_delta = _inc_max / _size;
	this.m_inc_max = _inc_max;

	this.empty = function() {
		return (this.m_nb_elem == 0);
	}

	this.push = function(e, t) {
		var i = 0;
		if (this.empty()) {
			this.m_t0 = t;
			this.m_i0 = 0;
		}
		else {

			// test to prevent errors
			if (t - this.m_t0 > this.m_inc_max) {
				console.log("Error: Increment="+(t - this.m_t0)+" >> Inc max "+this.m_inc_max);
				console.log("       e="+e+", t="+t+", m_t0="+this.m_t0);
			}

			// compute the indice in the circular array.
			i = Math.floor((t - this.m_t0) * this.m_size / this.m_inc_max);

			// compute the true indice in the regular array.
			if (i >= 0) {
				i = (i >= this.m_size) ? this.m_size - 1 : i;
				i = (i + this.m_i0) % this.m_size;
			}
			else {
				// if t < m_t0, compute new values for m_i0, m_t0, and verify that the end of the circular array is empty of at least |i| bucket.
				while (i++ < 0) {
					this.m_i0 = (this.m_i0 > 0) ? this.m_i0 - 1 : this.m_i0 - 1 + this.m_size;
					this.m_t0 -= this.m_delta;

					if (this.m_tab[this.m_i0].length) {
						console.log("Error : While shifting the begining of the queue, circular array not empty at the end");
						console.log("        e="+e+", t="+t);
						this.m_i0 = (this.m_i0 + 1) % this.m_size;
						this.m_t0 += this.m_delta;
						break;
					}
				}
				i = this.m_i0;
			}
		}

		this.m_nb_elem++;
		this.m_tab[i].push(e);
		return i;
	}

	this.pop = function() {
		if (this.empty()) return;
		
		// shift m_i0 in order to be on a non empty level of quantization
		while (!this.m_tab[this.m_i0].length) {
			this.m_i0 = (this.m_i0 + 1) % this.m_size;
			this.m_t0 += this.m_delta;
		}

		this.m_nb_elem--;
		return this.m_tab[this.m_i0].shift();
	}

	this.top = function() {
		if (this.empty()) return;
		
		// shift m_i0 in order to be on a non empty level of quantization
		while (!this.m_tab[this.m_i0].length) {
			this.m_i0 = (this.m_i0 + 1) % this.m_size;
			this.m_t0 += this.m_delta;
		}

		this.m_nb_elem--;
		return this.m_tab[this.m_i0][0];
	}

	this.increase_priority = function(e, bucket, t_new) {
		if (Math.abs(t_new - this.m_t0) > this.m_inc_max) {
			console.log("Error : Increment="+(t_new - this.m_t0)+" >> Inc max "+this.m_inc_max);
			console.log("        e="+e+", t="+t_new+", m_t0"+this.m_t0);
		}

		// compute the indice in the circular array
		var i = Math.floor((t_new-this.m_t0) * this.m_size / this.m_inc_max);

		// compute the true indice in the regular array.
		if (i >= 0) {
			i = (i >= this.m_size) ? this.m_size - 1 : i;
			i = (i + this.m_i0) % this.m_size;
		}
		else {
			// if t < m_t0, compute new values for m_i0, m_t0, and verify that the end of the circular array is empty of at least |i| bucket.
			while (i++ < 0) {
				this.m_i0 = (this.m_i0 > 0) ? this.m_i0 - 1 : this.m_i0 - 1 + this.m_size;
				this.m_t0 -= this.m_delta;

				if (this.m_tab[this.m_i0].length) {
					console.log("Error : While shifting the begining of the queue, circular array not empty at the end");
					console.log("        e="+e+", t="+t_new);
					this.m_i0 = (this.m_i0 + 1) % this.m_size;
					this.m_t0 += this.m_delta;
					break;
				}
			}
			i = this.m_i0;
		}

		this.m_tab[bucket].splice(this.m_tab[bucket].indexOf(e), 1);
		this.m_tab[i].push(e);

		return i;
	}

	this.clear = function() {
		this.m_nb_elem = 0;
		this.m_t0 = 0;
		this.m_i0 = 0;
		for (var i=0; i<this.m_size; i++) {
			this.m_tab[i].splice(0, this.m_tab[i].length);
		}
	}

	this.size = function() {
		return this.m_nb_elem;
	}
}