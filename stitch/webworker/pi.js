function CalculatePi(loop)
{
    importScripts('../ext_js/numeric-1.2.6.min.js');
    var c = parseInt(loop);
    var f = parseFloat(loop);
    var n=1;

    var A = [[1,2,3],
     [4,5,6],
     [7,3,9]];

    var x = [3,1,2];

    var b = numeric.dot(A,x);

    if (isNaN(c) || f != c ) {
        postMessage({'type': 'error', 'code': 'errInvalidNumber'});
        return;
    } else if (c<=0) {
        postMessage({'type': 'error', 'code': 'errNegativeNumber'});
        return;
    }
	
    for (var i=0,Pi=0;i<=c;i++) {
      Pi=Pi+(4/n)-(4/(n+2));
      n=n+4;
    }
    
    self.postMessage({'type': 'data', 'PiValue': Pi});
}
//wait for the start 'CalculatePi' message
//e is the event and e.data contains the JSON object
self.onmessage = function(e) {
  CalculatePi(e.data.value);
}