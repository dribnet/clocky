      // currently awol: https://github.com/CloudMade/Leaflet/issues/980
      /*
      L.CRS.Simple = L.extend({}, L.CRS, {
        projection: L.Projection.LonLat,
        transformation: new L.Transformation(1, 0, 1, 0)
      });
      */
      // extend doesn't exist, so this is my version...
      var mySimple = _.clone(L.CRS);
      mySimple.projection = L.Projection.LonLat;
      mySimple.transformation = new L.Transformation(1, 0, 1, 0);
      var map = L.map('map', {
        'crs': mySimple,
          minZoom: param.minZoom,
          maxZoom: param.maxZoom,
        'attributionControl': false,
        'detectRetina': true
      }).setView([0.5, 0.5], 10);

      if(param.initialBounds) {
        map.fitBounds(param.initialBounds);
      }
      //map.setMaxBounds([[1.0,0.0], [0.0,1.0]]);

      // create fullscreen control
      var fullScreen = new L.Control.FullScreen();
      // add fullscreen control to the map
      map.addControl(fullScreen);

      // FIXME 
      var hash = new L.Hash(map);

//        var layer = L.tileLayer('california-choice/{z}/{x}/{y}.png', {
      var layer = L.tileLayer(param.tileString, {
          continuousWorld: true
      });

      var attrib = new L.Control.Attribution;
      attrib.setPrefix( "" );
      if(param.attribution) {
        attrib.addAttribution(param.attribution); 
      }
      map.addControl( attrib );

      if(param.wrap) {
        // adapted from leaflet-src.js
        layer.getTileUrl = function (tilePoint) {
          this._adjustTilePoint(tilePoint);

          // map this x,y point to level 4 (16 across)
          var zoom =  this._getZoomForUrl();
          var range = Math.pow(2, zoom);

          // smallest postive modulo
          var modx = ((tilePoint.x % range) + range) % range;
          var mody = ((tilePoint.y % range) + range) % range;

          return L.Util.template('{z}/{x}/{y}.png', L.Util.extend({
            s: this._getSubdomain(tilePoint),
            z: zoom,
            x: modx,
            y: mody
          }, this.options));
        };
      }
      else if(param.doCustomTileUrl) {
        // adapted from leaflet-src.js
        layer.getTileUrl = function (tilePoint) {
          this._adjustTilePoint(tilePoint);

          // map this x,y point to level 4 (16 across)
          var zoom =  this._getZoomForUrl();
          var range = Math.pow(2, zoom);
          var x4s = (tilePoint.x * 16 / range);
          var y4s = (tilePoint.y * 16 / range);
          // we need extent to bounds check
          var x4s1 = ((tilePoint.x+1) * 16 / range);
          var y4s1 = ((tilePoint.y+1) * 16 / range);
          // console.log(x4s + ":" + x4s1);
          // bounds check
          if(x4s1 <= param.bounds['xmin'] || x4s > param.bounds['xmax'] || 
                y4s1 < param.bounds['ymin'] || y4s > param.bounds['ymax']) {
            return "";
          }
          x4s = Math.floor(x4s);
          y4s = Math.floor(y4s);
          var key = x4s.toString() + "," + y4s.toString();
          //console.log(key);
          tilename = param.tileLookup[key];
          if(!tilename) {
            return "";
          }

          var adjustedz = this._getZoomForUrl() - 4;
          var shift = Math.pow(2, adjustedz);

          return L.Util.template(tilename + '/{z}/{x}/{y}.png', L.Util.extend({
            s: this._getSubdomain(tilePoint),
            z: adjustedz,
            x: tilePoint.x - x4s * shift,
            y: tilePoint.y - y4s * shift
          }, this.options));
        };
      }

      if(!param.wrap) {
        layer.oldGetTileUrl = layer.getTileUrl;
        layer.getTileUrl = function (tilePoint) {
          var zoom =  this._getZoomForUrl();
          var range = Math.pow(2, zoom);
          var x4s = (tilePoint.x / range);
          var y4s = (tilePoint.y / range);
          // we need extent to bounds check
          var x4s1 = ((tilePoint.x+1) / range);
          var y4s1 = ((tilePoint.y+1) / range);
          if(x4s1 <= 0 || x4s >= 1 || y4s1 <= 0 || y4s >= 1) {
            //console.log("reject: " + tilePoint.x + "," + tilePoint.y);
            return "";
          }
          return layer.oldGetTileUrl(tilePoint);
        }
      }

      layer.addTo(map);

if(param.doCardPicker) {

  var MyCustomLayer = L.Class.extend({
      initialize: function (latlng) {
          // save position of the layer or any options from the constructor
          this._chosenOne = null;
          this._latlng = latlng;
          this._nullbound = [[0,0], [0, 0]];
          this._cards = _.map(param.cardMatrix, function(pair) {
            var lat1 = 0 + (pair[1] * param.latPerCard);
            var lat2 = 0 + ((pair[1] + 1) * param.latPerCard);
            if(param.latOffsetCard) {
              lat1 += param.latOffsetCard;
              lat2 += param.latOffsetCard;
            }
            var lng1 = 0 + (pair[0] * param.lngPerCard);
            var lng2 = 0 + ((pair[0] + 1) * param.lngPerCard);
            if(param.lngOffsetCard) {
              lng1 += param.lngOffsetCard;
              lng2 += param.lngOffsetCard;
            }
            return new L.LatLngBounds([[lat1, lng1], [lat2, lng2]]);
          });
          // this._cards = [
          //   [[14.559322, -5.767822], [56.1210604, 83.021240]]
          // ];
      },

      onAdd: function (map) {
          this._map = map;

  //        L.rectangle([[0.9, 0.1], [0.1, 0.9]], {color: "#FF0000", weight: 1}).addTo(map);
          var shades = 0.25;
          var sideStyle = {color: "#000000", 'stroke': false, 'fillOpacity': shades};
          var mainStyle = {color: "#FFFF00", weight: 3, 'fill': false};
          var allStyle = {color: "#FFFF00", weight: 1, 'fill': false};
          sideStyle = {color: "#000000", 'stroke': false, 'fill': true, 'fillOpacity': shades};
          this._boxel = L.rectangle(this._nullbound, mainStyle).addTo(map);
          this._boxel.setStyle({'fill': false});
          this._leftel = L.rectangle(this._nullbound, sideStyle).addTo(map);
          this._rightel = L.rectangle(this._nullbound, sideStyle).addTo(map);
          this._topel = L.rectangle(this._nullbound, sideStyle).addTo(map);
          this._bottomel = L.rectangle(this._nullbound, sideStyle).addTo(map);

          this._allRectArray = _.map(this._cards, function(bnd) {
            return L.rectangle(bnd, allStyle);
          });
          _.each(this._allRectArray, function(rect) {
            map.addLayer(rect);
          });

          // add a viewreset event listener for updating layer's position, do the latter
          map.on('viewreset', this._reset, this);
          map.on('mousemove', this.mouseMove, this);
          map.on('click', this.mouseDown, this);
          this._reset();
      },

      onRemove: function (map) {
          // remove layer's DOM elements and listeners
          map.getPanes().overlayPane.removeChild(this._el);
          map.off('viewreset', this._reset, this);
      },


      mouseMove: function(e) {
        this._latlng = e.latlng;
        //console.log("" + e.latlng);
        this._reset();
      },

      mouseDown: function(e) {
        if(this._chosenOne != null) {
          return;
        }

        var latlng = e.latlng;

        // define rectangle geographical bounds
        var boxBounds = _.find(this._cards, function(bnd) {
          return bnd.contains(latlng);
        });

        if(boxBounds) {
          // turn off grid
          _.each(this._allRectArray, function(rect) {
            map.removeLayer(rect);
          });

          this._chosenOne = boxBounds;
          //console.log("found: " + boxBounds);
          this._map.fitBounds(this._chosenOne);
          this._reset();
        }
      },

      _reset: function () {
        var latlng = this._latlng;

          var boxBounds = this._chosenOne;

          if(boxBounds == null) {
            // define rectangle geographical bounds
            boxBounds = _.find(this._cards, function(bnd) {
              return bnd.contains(latlng);
            });
          }

          if(boxBounds == null) {
            boxBounds =  new L.LatLngBounds(this._nullbound);
          }

          if (boxBounds) {
            var boxSwCorner = boxBounds.getSouthWest();
            var boxNeCorner = boxBounds.getNorthEast();
            var boxNwCorner = boxBounds.getNorthWest();
            var boxSeCorner = boxBounds.getSouthEast();

            // zoom the map to the rectangle bounds
            // map.fitBounds(boxBounds);

            var wholeBounds = map.getBounds();
            var fullSwCorner = wholeBounds.getSouthWest();
            var fullNeCorner = wholeBounds.getNorthEast();
            //console.log(wholeBounds);

            this._boxel.setBounds(boxBounds);
            this._leftel.setBounds([fullSwCorner, [fullNeCorner.lat, boxSwCorner.lng]]);
            this._rightel.setBounds([[fullSwCorner.lat, boxNeCorner.lng], fullNeCorner]);
            this._topel.setBounds([boxNwCorner, [fullNeCorner.lat, boxNeCorner.lng]]);
            this._bottomel.setBounds([[fullSwCorner.lat,boxSwCorner.lng], boxSeCorner]);
          }
          else {
            this._boxel.setBounds(this._nullbound);
            this._leftel.setBounds(this._nullbound);
            this._rightel.setBounds(this._nullbound);
            this._topel.setBounds(this._nullbound);
            this._bottomel.setBounds(this._nullbound);
          }


      }
  });

  var latlng = new L.LatLng(0, 0);
  map.addLayer(new MyCustomLayer(latlng));
}
