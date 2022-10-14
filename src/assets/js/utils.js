window.onload = function player () {
    var styledRanges = document.getElementsByClassName('styled_range');
    for (var i=0; i<styledRanges.length; i++) {
      var thumbRange = null, trackRange = null;
      for (var j=0; j<styledRanges[i].children.length; j++) {
        var child = styledRanges[i].children[j];
        if (child.className === 'thumb_range')
          var thumbRange = child;
        else if (child.className === 'track_range')
          var trackRange = child;
      }
      thumbRange.oninput = function(thumbRange, trackRange) {
        return function(e) {
          trackRange.value = thumbRange.value;
        };
      }(thumbRange, trackRange);
    }
  }