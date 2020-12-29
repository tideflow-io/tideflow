/**
 * Compare two 2d arrays.
 *  
 * @param {*} arr1 
 * @param {*} arr2 
 * @return {boolean}
 */
const compareArrays = (arr1, arr2) => {
  return arr1.sort().join() === arr2.sort().join()
}

module.exports.compareArrays = compareArrays

const arrayUnique = lists => {
  var a = lists.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }

  return a;
}

module.exports.arrayUnique = arrayUnique

const intersects = (a, b) => {
  return !!(a || []).filter(value => (b || []).includes(value)).length
}

module.exports.intersects = intersects