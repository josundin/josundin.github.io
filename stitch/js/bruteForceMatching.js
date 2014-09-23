//bruteForceMatching.js

(function(_this){
"use strict";

	var desObj = function(descriptors1, descriptors2){
		this.descriptors1 = descriptors1;
		this.descriptors2 = descriptors2;
	    this.matches = [];

	   	this.img = new Image();
	    this.img.src = "../imgs/favicon.ico";
		}

	//function myPowerConstructor(x){
	_this['bruteForceMatching'] = function(descriptors1, descriptors2, threshold){

		var that = new desObj(descriptors1, descriptors2);

		var lowe_criterion = threshold;

		//var matches = [];
		//var dists = 0;

		//Computes the Squared Eucledian distance between the vectors
		function computeVectorDistance(p ,q){
		// dist = dot( (vec1 - vec2).T,(vec1 - vec2))
		//var d = Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
		var d = 0;
		for(var i =0; i < p.length; i++)
			d += Math.pow(p[i] - q[i], 2);

		return Math.sqrt(d);

		}

		function byDist(a, b) {
			if (a[1] < b[1]) return -1;
			if (b[1] < a[1]) return 1;
			return 0;
		}

		function computeDescriptor() {

			var dists = [];
			var test = [];
			var dista = [];
			var imgdata = [];

			for (var i = 0; i < that.descriptors1.length; i++) {
				dists = [];
				test = [];
				for(var j = 0; j < that.descriptors2.length; j++) {
				dista = computeVectorDistance(that.descriptors1[i][1], that.descriptors2[j][1]);
				imgdata = [that.descriptors2[j][0], dista];
				dists.push(imgdata);
				test.push(dista);
			}
			//sort
			dists.sort(byDist);
			//Lowe criterion with threshold for these descriptors
			if((dists[0][1] / dists[1][1] ) < lowe_criterion)
			that.matches.push([that.descriptors1[i][0] ,dists[0][0]]);
			   
			}  

			console.log(that.matches.length);

			}

		return {
			set: function( callback) {

				that.img.onload = function() {

					computeDescriptor();

					console.log( "2 gang", that.matches.length);

					callback();
				}
				return ;
			},
        	getMatches: function() {
        		//var npts = that.count;
        		 return that.matches;
        	}
		};
	}
}(this));
