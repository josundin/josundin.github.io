//layout.js

  ///////////////////////////////
  //These are global over files
  var maxHeight = 640;
  var maxWidth = 640;
  ///////////////////////////////

  // function findScale(xSize,ySize,xGoal,yGoal){
  //   // We'll either to match `xSize` to `xGoal` or `ySize` to `yGoal` so
  //   // compute a scale for each.
  //   var xScale = xGoal / xSize;
  //   var yScale = yGoal / ySize;

  //   if(yScale < 1 || xScale < 1)
  //   {
  //       // If xScale makes it too tall we'll have to use yScale
  //     // and if yScale makes it too wide we'll have to use xScale
  //     if( xScale * ySize > yGoal ){
  //         return yScale;
  //     }else{
  //         return xScale;
  //     }
  //   }
  //   else
  //     return 1;
  // }

  function findScale(xSize,ySize){
    var xScale = maxWidth / xSize;
    var yScale = maxHeight / ySize;

    // console.log("the stuff", xScale, yScale);

    if(yScale < 1 || xScale < 1)
    {
        // If xScale makes it too tall we'll have to use yScale
      // and if yScale makes it too wide we'll have to use xScale
      if( xScale * ySize > maxHeight ){
          return yScale;
      }else{
          return xScale;
      }
    }
    else
      return 1;
  }
