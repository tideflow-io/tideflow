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