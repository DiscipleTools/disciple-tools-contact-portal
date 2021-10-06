jQuery(document).ready(function() {
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
  window.load_tree()

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

        let new_id = 'new_id_'+window.new_inc
        console.log( e.attr('id', 'new_id_'+window.new_inc) )

        // window.create_group( new_id )

        window.new_item = {
          inc: window.new_inc,
          temp_id: new_id,
          parent_id: 'domenu-0'
        }


        // jQuery('.loading-spinner').addClass('active')
        // console.log( e )
        //
        // window.new_inc++
        // let title = jsObject.post.title + ' Group ' + window.new_inc
        // window.post_item('onItemCreated', { title: title } ).done(function(create_data){
        //
        //   if ( create_data ) {
        //     e[0].id = create_data.ID
        //     e[0].dataset.prev_parent = 'domenu-0'
        //     jQuery('#'+ create_data.ID + ' .item-name').html( create_data.title )
        //   } else {
        //     console.log(create_data)
        //   }
        //
        //   jQuery('.loading-spinner').removeClass('active')
        //   console.log( e[0].id )
        // })

      })
      .onItemAddChildItem(function(e) {
        console.log('onItemAddChildItem')

        console.log( e[0].id )
        window.new_item.parent_id = e[0].id



        // jQuery('.loading-spinner').addClass('active')
        //
        // window.new_inc++
        // let title = jsObject.post.title + ' Group ' + window.new_inc
        // window.post_item('onItemAddChildItem', { title: title, parent_id: 0 } ).done(function(add_child_data){
        //
        //   if ( add_child_data ) {
        //     e[0].id = add_child_data.ID
        //     e[0].dataset.prev_parent = 'domenu-0'
        //     jQuery('#'+ add_child_data.ID + ' .item-name').html( add_child_data.title )
        //   } else {
        //     e[0].id = add_child_data
        //     jQuery('#'+ e[0].id ).html( 'Not created. Error.' )
        //   }
        //
        //   jQuery('.loading-spinner').removeClass('active')
        // })


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

          // jQuery('.loading-spinner').addClass('active')
          // console.log( e )
          //
          // let new_parent = e[0].id //e[0].parentNode.parentNode.id
          // let self = e[0].id
          //
          // console.log(' - new parent: '+ new_parent)
          // console.log(' - self: '+ self)
          //
          // let prev_parent_object = jQuery('#'+e[0].id)
          // let previous_parent = prev_parent_object.data('prev_parent')
          // console.log(' - previous parent: ' + previous_parent )
          //
          // prev_parent_object.attr('data-prev_parent', new_parent ) // set previous
          //
          // if ( new_parent !== previous_parent ) {
          //   window.post_item('onItemDrop', { new_parent: new_parent, self: self, previous_parent: previous_parent } ).done(function(drop_data){
          //     jQuery('.loading-spinner').removeClass('active')
          //     if ( drop_data ) {
          //       console.log('success onItemDrop')
          //     }
          //     else {
          //       console.log('did not edit item')
          //     }
          //   })
          // }

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
    jQuery("li:not(:has(>ol)) .item-remove").show()
    // set title
    jQuery.each(jQuery('.item-name'), function(ix,vx) {
      let old_title = jQuery(this).html()
      jQuery(this).html(data.title_list[old_title])
    })

    jQuery('#domenu-0 .item-add').on('click', function(e) {
      window.create_group()
    })
    jQuery('#domenu-0 .item-edit').on('click', function(e) {
      window.edit_modal({ id: e.attr('id')} )
    })
    jQuery('.dd-new-item').on('click', function() {
      
    })
  }

  window.create_group = () => {
    jQuery('.loading-spinner').addClass('active')

    console.log( window.new_item )

    window.post_item('create_group', window.new_item )
      .done(function(response){

      if ( response ) {

        jQuery('#'+ response.temp_id).attr('id', response.id )
        jQuery('#'+response.id).attr('data-prev_parent', response.prev_parent )
        jQuery('#'+response.id + ' .item-name:first').html( response.title )
        jQuery('#'+response.id + ' .item-add:first').on('click', function(e) {
          window.create_group()
        })
        jQuery('#'+response.id + ' .item-edit:first').on('click', function(e) {
          window.edit_modal({ id: response.id } )
        })

      } else {
        console.log(response)
      }

      jQuery('.loading-spinner').removeClass('active')
    })
  }

  window.edit_modal = ( data ) => {

    // @todo open edit modal
    jQuery('#edit-modal').foundation('open')

  }

});
