/* 
 Raster Fairy v1.0.3,
 released 22.01.2016

 The purpose of Raster Fairy is to transform any kind of 2D point cloud into
 a regular raster whilst trying to preserve the neighborhood relations that
 were present in the original cloud. If you feel the name is a bit silly and
 you can also call it "RF-Transform".

 NOTICE: if you use this algorithm in an academic publication, paper or 
 research project please cite it either as "Raster Fairy by Mario Klingemann" 
 or "RF-Transform by Mario Klingemann"


 
 Copyright (c) 2016, Mario Klingemann, mario@quasimondo.com
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
     * Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.
     * Redistributions in binary form must reproduce the above copyright
       notice, this list of conditions and the following disclaimer in the
       documentation and/or other materials provided with the distribution.
     * Neither the name of the Mario Klingemann nor the
       names of its contributors may be used to endorse or promote products
       derived from this software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL MARIO KLINGEMANN BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


const np = require('numjs');

export function transformPointCloud2D( points2d, target, autoAdjustCount = true, proportionThreshold = 0.4){

    let pointCount = points2d.length;
    let width;
    let height;
    if (!target){
        target = getRectArrangements(pointCount)[0];
        if (target[0] / target[1] < proportionThreshold){
            width = Math.int(Math.sqrt(pointCount));
            height = Math.int(Math.ceil(pointCount/width));
            console.log("no good rectangle found for " + pointCount + " points, using incomplete square " + width + " * " + height);
            target = {'width':width,'height':height,'mask':np.zeros((height,width),dtype=int), 'count':width*height, 'hex': false}
        }
    }

    if (Array.isArray(target) && target.length == 2){
        //print "using rectangle target"
        if (target[0] * target[1] < pointCount){
            console.log("ERROR: target rectangle is too small to hold data: Rect is " + target[0] + "*" + target[1] + "=" + (target[0] * target[1]) + " vs " + pointCount + " data points");
            return false;
        }
        width = target[0];
        height = target[1];
    }
        
    var quadrants = [{'points':points2d, 'grid':[0,0,width,height], 'indices':np.arange(pointCount)}];
    var failedSlices = 0;
    var i = 0;

    while (i < quadrants.length && quadrants.length < pointCount){
        if ( quadrants[i] && quadrants[i]['points'].length > 1 ){
            let slices = sliceQuadrant(quadrants[i]);
            if (slices.length > 1){
                quadrants = slices;
                i = 0;
            } else {
                failedSlices ++;
            }
        }
        else {
            i++;
        }

    }
            
    if (failedSlices > 0){
        console.log("WARNING - There might be a problem with the data. Try using autoAdjustCount=True as a workaround or check if you have points with identical coordinates in your set.");
    }

    let gridPoints2d = Object.assign({}, points2d);

    for (let q = 0; q < quadrants.length; q++){

        gridPoints2d[quadrants[q]['indices'][0]] = quadrants[q]['grid'].slice(0,2);
    }
    console.log([gridPoints2d, width, height]);
    return [gridPoints2d, (width, height)];
}


function sliceQuadrant( quadrant){
    
    let xy = quadrant['points'];
    let grid = quadrant['grid'];
    let indices = quadrant['indices'].selection ? quadrant.indices.selection.data: quadrant.indices;

    let slices = [];
    let sliceXCount, sliceYCount, sliceCount, sliceSize, pointsPerSlice;

    if (grid[2] > 1){
        sliceXCount = 2;
        while (grid[2] % sliceXCount != 0){
            sliceXCount++;
        }
    } else {
        sliceXCount = grid[3];
    }

    if (grid[3] > 1){
        sliceYCount = 2;
        while (grid[3] % sliceYCount != 0){
            sliceYCount++;
        }
    } else {
        sliceYCount = grid[2];
    }
        
    let splitX = (sliceXCount < sliceYCount) || (sliceXCount === sliceYCount && grid[2] > grid[3]);
    let order, gridOffset;
    if (splitX) { 
        order = lexSort(xy, 0);
        sliceCount = sliceXCount
        sliceSize  = grid[2] / sliceCount
        pointsPerSlice = grid[3] * sliceSize
        gridOffset = grid[0]
    } else {
        order = lexSort(xy, 1);
        sliceCount = sliceYCount
        sliceSize = grid[3] / sliceCount
        pointsPerSlice = grid[2] * sliceSize
        gridOffset = grid[1]
    }
    for (let i = 0; i < sliceCount; i++){
        let sliceObject = {};
        sliceObject["points"] = getSorted(xy, order).slice(i*pointsPerSlice, (i+1)*pointsPerSlice);
        if (sliceObject['points'].length > 0){

            sliceObject["indices"] = getSorted(indices, order).slice(i*pointsPerSlice, (i+1)*pointsPerSlice);
            if (splitX) {
                sliceObject['grid'] = [gridOffset,grid[1],sliceSize,grid[3]];
                gridOffset += sliceObject['grid'][2];
            } else {
                sliceObject['grid'] = [grid[0],gridOffset,grid[2],sliceSize];
                gridOffset += sliceObject['grid'][3];
            }
            slices.push(sliceObject);
        }
    }
             
    return slices
}


function lexSort(sortBy, primeSort){
    return sortWithIndeces(sortBy, primeSort);;
}

//from https://stackoverflow.com/a/4046990/3899852
function getSorted(arr, sortArr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    result[i] = arr[sortArr[i]];
  }
  return result;
}


//from https://stackoverflow.com/a/3730579/3899852
function sortWithIndeces(toSort, index) {
  let bIndex = index === 1 ? 0 : 1;
  let newSort = [];
  for (var i = 0; i < toSort.length; i++) {
    newSort.push([toSort[i][index], toSort[i][bIndex], i]);
  }

  newSort.sort(function(left, right) {
    if (left[0] < right[0]){
        return -1;
    } else if (left[0] > right[0]){
        return 1;
    } else {
        if (left[1] < right[1]){
            return -1;
        } else {
            return 1;
        }
    }
  });
  let sortIndices = [];
  for (var j = 0; j < newSort.length; j++) {
    sortIndices.push(newSort[j][2]);
  }
  return sortIndices;
}
