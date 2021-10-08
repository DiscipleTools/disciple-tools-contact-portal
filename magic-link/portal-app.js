
jQuery(document).ready(function() {
  if ( '' === jsObject.parts.action  ) {
    window.load_tree()
  } else if ( 'groups' === jsObject.parts.action  ) {
    window.load_tree()
  }

});

window.load_tree = () => {
  jQuery.ajax({
    type: "GET",
    data: { action: 'get', parts: jsObject.parts },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    url: jsObject.root + jsObject.parts.root + '/v1/' + jsObject.parts.type,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('X-WP-Nonce', jsObject.nonce )
    }
  })
    .done(function(data){
      console.log(data)

      window.load_domenu(data)

      jQuery('.loading-spinner').removeClass('active')
    })
    .fail(function(e) {
      console.log(e)
      jQuery('#error').html(e)
      jQuery('.loading-spinner').removeClass('active')
    })
}

window.load_domenu = ( data ) => {

  window.new_inc = 0

  jQuery('#domenu-0').domenu({
    data: JSON.stringify( data.tree ),
    maxDepth: 500,
    refuseConfirmDelay: 500, // does not delete immediately but requires a second click to confirm.
    select2:                {
      support:     false, // Enable Select2 support
    }
  }).parseJson()

    .onCreateItem(function(e) {
      console.log('onCreateItem')

      window.new_inc++

      window.new_item = {
        inc: window.new_inc,
        temp_id: 'new_id_'+window.new_inc,
        parent_id: 'domenu-0'
      }

      e.attr('id', 'new_id_'+window.new_inc )
    })
    .onItemAddChildItem(function(e) {
      console.log('onItemAddChildItem')
      console.log( e[0].id )
      window.new_item.parent_id = e[0].id
    })
    .onItemRemoved(function(e) {
      if ( window.last_removed !== e[0].id ) {
        console.log('onItemRemoved')
        jQuery('.loading-spinner').addClass('active')

        window.last_removed = e[0].id

        window.post_item('onItemRemoved', { id: e[0].id} ).done(function(remove_data){
          if ( remove_data ) {
            console.log('success onItemRemoved')
          }
          else {
            console.log('did not remove item')
          }
          jQuery('.loading-spinner').removeClass('active')
        })
      }
    })
    .onItemDrop(function(e) {
      if ( typeof e.prevObject !== 'undefined' && typeof e[0].id !== 'undefined' ) { // runs twice on drop. with and without prevObject
        console.log('onItemDrop')
        jQuery('.loading-spinner').addClass('active')

        let new_parent = e[0].parentNode.parentNode.id
        let self = e[0].id

        console.log(' - new parent: '+ new_parent)
        console.log(' - self: '+ self)

        let prev_parent_object = jQuery('#'+e[0].id)
        let previous_parent = prev_parent_object.data('prev_parent')
        console.log(' - previous parent: ' + previous_parent )

        prev_parent_object.attr('data-prev_parent', new_parent ) // set previous

        if ( new_parent !== previous_parent ) {
          window.post_item('onItemDrop', { new_parent: new_parent, self: self, previous_parent: previous_parent } ).done(function(drop_data){
            jQuery('.loading-spinner').removeClass('active')
            if ( drop_data ) {
              console.log('success onItemDrop')
            }
            else {
              console.log('did not edit item')
            }
          })
        }

      }
    })
    .onItemSetParent(function(e) {
      if (typeof e[0] !== 'undefined' ) {
        console.log('onItemSetParent')
        console.log(' - has children: ' + e[0].id)
        jQuery('#' + e[0].id + ' button.item-remove:first').hide();
      }
    })
    .onItemUnsetParent(function(e) {
      if (typeof e[0] !== 'undefined' ) {
        console.log('onItemUnsetParent')
        console.log(' - has no children: '+ e[0].id)
        jQuery('#' + e[0].id + ' button.item-remove:first').show();
      }
    })


  // list prep
  jQuery.each( jQuery('#domenu-0 .item-name'), function(i,v){
    // move and set the title to id
    jQuery(this).parent().parent().attr('id', jQuery(this).html())
  })
  // set the previous parent data element
  jQuery.each( data.parent_list, function(ii,vv) {
    if ( vv !== null && vv !== "undefined") {
      let target = jQuery('#'+ii)
      if ( target.length > 0 ) {
        target.attr('data-prev_parent', vv )
      }
    }
  })
  // show delete for last item
  jQuery("li:not(:has(>ol)) .item-remove").show()
  // set title
  jQuery.each(jQuery('.item-name'), function(ix,vx) {
    let old_title = jQuery(this).html()
    jQuery(this).html(data.title_list[old_title])
  })
  // add listener to top add item box
  jQuery('.dd-new-item').on('click', function() {
    window.create_group()
  })
  // set listener for add submenu items
  jQuery('#domenu-0 .item-add').on('click', function(e) {
    window.create_group()
  })
  // set listener for edit button
  jQuery('#domenu-0 .item-edit').on('click', function(e) {
    window.edit_modal(e.currentTarget.parentNode.parentNode.parentNode.id)
  })
}

window.edit_modal = ( id ) => {
  let title = jQuery('#modal-title')
  let content = jQuery('#modal-content')

  title.empty().html(`<span class="loading-spinner active"></span>`)
  content.empty()

  jQuery('#edit-modal').foundation('open')

  window.post_item('get_group', { id: id } )
    .done(function(response){
      console.log(response)
      if ( typeof response.errors === 'undefined' ) {
        let member_count = 0
        if ( typeof response.post.member_count !== 'undefined' ) {
          member_count = response.post.member_count
        }

        // template

        jQuery('#modal-title').html('<h1>Edit Group</h1><hr>')
        jQuery('#modal-content').append(`
          <div class="grid-x">

            <!-- title -->
            <div class="cell">
              Name<br>
              <div class="input-group">
                <input type="text" style="border:0; border-bottom: 1px solid darkgrey;font-size:1.5rem;line-height: 2rem;" id="group_title" value="${response.post.name}" />
                <div class="input-group-button">
                     <div><span class="loading-field-spinner group_title"></span></div>
                </div>
              </div>
            </div>

            <!-- members -->
            <div class="cell">
              Number of Members<br>
              <div class="input-group">
                <input type="number" style="border:0; border-bottom: 1px solid darkgrey;font-size:1.5rem;line-height: 2rem;" id="group_member_count" value="${member_count}" />
                <div class="input-group-button">
                     <div><span class="loading-field-spinner group_member_count"></span></div>
                </div>
              </div>
            </div>

            <!-- location -->
            <div class="cell" id="mapbox-select">
              Location<br>
              <div id="map-wrapper">
                  <div id='map'></div>
              </div>
              <br>
              <button type="button" onclick="save_new_location(${id})" id="result_display" style="display:none;" class="button primary-button-hollow add-location">Save</button>
              <button type="button" onclick="cancel_new_location()" style="display:none;" class="button primary-button-hollow add-location">Cancel</button>
              <span class="loading-field-spinner group_location"></span>
            </div>

          </div>
        `)

        // listeners

        jQuery('#group_title').on('change', function(e){
          jQuery('.loading-field-spinner.group_title').addClass('active')
          window.post_item('update_group_title', { post_id: id, new_value: e.target.value } )
            .done(function(result) {
              console.log(result)
              if ( typeof result.errors === 'undefined') {
                jQuery('#group_title').attr('value', result.name)
                jQuery('#'+id + ' .item-name:first').html(result.name)
              }
              else {
                console.log(result)
              }
              jQuery('.loading-field-spinner.group_title').removeClass('active')
            })
        })
        jQuery('#group_member_count').on('change', function(e){
          jQuery('.loading-field-spinner.group_member_count').addClass('active')
          window.post_item('update_group_member_count', { post_id: id, new_value: e.target.value } )
            .done(function(result) {
              console.log(result)
              if ( typeof result.errors === 'undefined') {
                jQuery('#group_member_count').attr('value', result.member_count)
              }
              else {
                console.log(result)
              }
              jQuery('.loading-field-spinner.group_member_count').removeClass('active')
            })
        })

        let lng,lat
        if( response.post.location_grid_meta ) {
          lng = response.post.location_grid_meta[0].lng
          lat = response.post.location_grid_meta[0].lat
        }
        load_mapbox(lng, lat)

      } else {
        console.log(response)
      }

      jQuery('.loading-spinner').removeClass('active')
    })
}

window.post_item = ( action, data ) => {
  return jQuery.ajax({
    type: "POST",
    data: JSON.stringify({ action: action, parts: jsObject.parts, data: data }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    url: jsObject.root + jsObject.parts.root + '/v1/' + jsObject.parts.type,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('X-WP-Nonce', jsObject.nonce )
    }
  })
    .fail(function(e) {
      console.log(e)
      jQuery('#error').html(e)
      jQuery('.loading-spinner').removeClass('active')
    })
}

window.create_group = () => {
  console.log('create_group')
  jQuery('.loading-spinner').addClass('active')

  console.log( window.new_item )

  window.post_item('create_group', window.new_item )
    .done(function(response){
      console.log(response)
      if ( response ) {

        jQuery('#'+ response.temp_id).attr('id', response.id )
        jQuery('#'+response.id).attr('data-prev_parent', response.prev_parent )
        jQuery('#'+response.id + ' .item-name:first').html( response.title )
        jQuery('#'+response.id + ' .item-add:first').on('click', function(e) {
          window.create_group()
        })
        jQuery('#'+response.id + ' .item-edit:first').on('click', function(e) {
          window.edit_modal(response.id )
        })

      } else {
        console.log(response)
      }

      jQuery('.loading-spinner').removeClass('active')
    })
}

window.load_mapbox = (lng,lat) => {

  let center, zoom
  if ( lng ) {
    center = [lng, lat]
  } else {
    center = [-20, 30]
  }

  /***********************************
   * Map
   ***********************************/
  mapboxgl.accessToken = jsObject.map_key;
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: center,
    zoom: 1
  });

  window.force_values = false
  if ( lng ) {
    let marker_center = new mapboxgl.LngLat(lng, lat)
    window.active_marker = new mapboxgl.Marker()
      .setLngLat(marker_center)
      .addTo(map);
    map.flyTo({
      center: center,
      zoom: 12,
      bearing: 0,
      speed: 2, // make the flying slow
      curve: 1, // change the speed at which it zooms out
      easing: (t) => t,
      essential: true
    });
    window.force_values = true
  }


  /***********************************
   * Click
   ***********************************/
  map.on('click', function (e) {
    console.log(e)

    let lng = e.lngLat.lng
    let lat = e.lngLat.lat
    window.active_lnglat = [lng,lat]

    // add marker
    if ( window.active_marker ) {
      window.active_marker.remove()
    }
    window.active_marker = new mapboxgl.Marker()
      .setLngLat(e.lngLat )
      .addTo(map);

    jQuery('#result_display').html(`Save Clicked Location`)
    jQuery('.add-location').show()

    window.location_data = {
      location_grid_meta: {
        values: [
          {
            lng: lng,
            lat: lat,
            level: 'lnglat',
            label: 'lnglat',
            source: 'user'
          }
        ],
        force_values: window.force_values
      }
    }

  });

  /***********************************
   * Search
   ***********************************/
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    types: 'country region district locality neighborhood address place',
    mapboxgl: mapboxgl
  });
  map.addControl(geocoder);
  geocoder.on('result', function(e) { // respond to search
    console.log(e)
    if ( window.active_marker ) {
      window.active_marker.remove()
    }
    window.active_marker = new mapboxgl.Marker()
      .setLngLat(e.result.center)
      .addTo(map);
    geocoder._removeMarker()

    jQuery('#result_display').html(`Save Searched Location`)
    jQuery('.add-location').show()

    window.location_data = {
      location_grid_meta: {
        values: [
          {
            lng: e.result.center[0],
            lat: e.result.center[1],
            level: e.result.place_type[0],
            label: e.result.place_name,
            source: 'user'
          }
        ],
        force_values: window.force_values
      }
    }
  })

  /***********************************
   * Geolocate Browser
   ***********************************/
  let userGeocode = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    marker: {
      color: 'orange'
    },
    trackUserLocation: false,
    showUserLocation: false
  })
  map.addControl(userGeocode);
  userGeocode.on('geolocate', function(e) { // respond to search
    console.log(e)
    if ( window.active_marker ) {
      window.active_marker.remove()
    }

    let lat = e.coords.latitude
    let lng = e.coords.longitude

    window.active_lnglat = [lng,lat]
    window.active_marker = new mapboxgl.Marker()
      .setLngLat([lng,lat])
      .addTo(map);

    jQuery('#result_display').html(`Save Current Location`)
    jQuery('.add-location').show()

    window.location_data = {
      location_grid_meta: {
        values: [
          {
            lng: lng,
            lat: lat,
            level: 'lnglat',
            label: 'geolocated lnglat',
            source: 'user'
          }
        ],
        force_values: window.force_values
      }
    }
  })

  // if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  //   map.addControl(new mapboxgl.NavigationControl());
  // }
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
  map.addControl(new mapboxgl.NavigationControl());

}
function activate_geolocation() {
  jQuery(".mapboxgl-ctrl-geolocate").click();
}
function save_new_location( id) {
  if ( typeof window.location_data === undefined || window.location_data === false ) {
    jQuery('#result_display').html(`You haven't selected anything yet. Click, search, or allow auto location.`)
    return;
  }
  jQuery('.loading-field-spinner.group_location').addClass('active')

  console.log(window.location_data)

  window.post_item('update_group_location', { post_id: id, location_data: window.location_data } )
    .done(function(result) {
      console.log(result)
      jQuery('.add-location').hide();
      jQuery('.loading-field-spinner.group_location').removeClass('active')
    })
}
function cancel_new_location() {
  jQuery('.add-location').hide();
  window.location_data = false;
  if ( window.active_marker ) {
    window.active_marker.remove()
  }
  jQuery('.mapboxgl-ctrl-geocoder--input').val('')
}
