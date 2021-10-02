$(document).ready(function($) {
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
        let list = $('ol.dd-list')
        $.each(data, function(i,v){
          list.append(`
          <li class="dd-item" id="${v.id}" data-prev-parent="domenu-0">
              <button class="collapse" data-action="collapse" type="button" style="display: none;">–</button>
              <button class="expand" data-action="expand" type="button" style="display: none;">+</button>
              <div class="dd-handle dd3-handle">&nbsp;</div>
              <div class="dd3-content">
                  <div class="item-name">${v.title}</div>
                  <div class="dd-button-container">
                      <button class="item-edit" >✎</button>
                      <button class="item-add">+</button>
                      <button class="item-remove">&times;</button>
                  </div>
                  <div class="dd-edit-box" style="display: none;">
                      <input type="text" name="title" autocomplete="off" placeholder="Item"
                             data-placeholder="${v.title}"
                             data-default-value="${v.title}">
                  </div>
              </div>
          </li>
          `)
        })
        window.load_domenu()
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

  window.load_domenu = (  ) => {
    let inc = 0
    $('#domenu-0').domenu({
      // data: data,
      maxDepth: 500,
      refuseConfirmDelay: 500, // does not delete immediately but requires a second click to confirm.
      select2:                {
        support:     false, // Enable Select2 support
      }
    })
      .onItemAddChildItem(function(e) {
        console.log('onItemAddChildItem')
        console.log(e)
      })
      .onItemAdded(function(e) {
        console.log('onItemAdded')
        $('.loading-spinner').addClass('active')
        inc++
        let title = jsObject.post.title + ' Group ' + inc
        window.setup_listeners()
        window.post_item('onItemAdded', { title: title } ).done(function(new_data){
          $('.loading-spinner').removeClass('active')
          if ( new_data ) {
            e[0].id = new_data
            $('#'+ new_data + ' .item-name').html( title )
          } else {
            $('#'+ e[0].id ).html( 'Not created. Error.' )
          }

        })
      })
      .onItemRemoved(function(e) {
        if ( window.last_removed !== e[0].id ) {
          $('.loading-spinner').addClass('active')
          window.last_removed = e[0].id

          console.log('onItemRemoved')
          window.post_item('onItemRemoved', { id: e[0].id} ).done(function(remove_data){
            $('.loading-spinner').removeClass('active')
            if ( remove_data ) {
              console.log('success onItemRemoved')
            }
            else {
              console.log('did not remove item')
            }
          })
        }
      })
      .onItemDrop(function(e) {
        if ( typeof e.prevObject !== 'undefined' && typeof e[0].id !== 'undefined' ) { // runs twice on drop. with and without prevObject
          console.log('onItemDrop')
          $('.loading-spinner').addClass('active')

          let new_parent = e[0].parentNode.parentNode.id
          let self = e[0].id

          console.log(' - new parent: '+ new_parent)
          console.log(' - self: '+ self)

          let prev_parent_object = $('#'+e[0].id)
          let previous_parent = prev_parent_object.data('prev-parent')
          console.log(' - previous parent: ' + previous_parent )

          prev_parent_object.data('prev-parent', new_parent ) // set previous

          if ( new_parent !== previous_parent ) {
            window.post_item('onItemDrop', { new_parent: new_parent, self: self, previous_parent: previous_parent } ).done(function(drop_data){
              $('.loading-spinner').removeClass('active')
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

          $('#' + e[0].id + ' button.item-remove').hide();
        }
      })
      .onItemUnsetParent(function(e) {
        if (typeof e[0] !== 'undefined' ) {
          console.log('onItemUnsetParent')
          console.log(' - has no children: '+ e[0].id)

          $('#' + e[0].id + ' button.item-remove').show();
        }
      })
      .onItemExpanded(function(e) {
        console.log('onItemExpanded')
        // console.log(e)
      })
      .onItemCollapsed(function(e) {
        console.log('onItemCollapsed')
        // console.log(e)
      })

      // .onItemDrag(function(e) {
      //   console.log('onItemDrag')
      //   console.log(e)
      // })
      // .onCreateItem(function(e) {
      //   console.log('onCreateItem')
      //   // console.log(e)
      // })

      // .on(['onItemCollapsed', 'onItemExpanded'], function(a, b, c) {
      //   console.log('listener fired .on[\'onItemCollapsed\', \'onItemExpanded\']')
      // });



  }

  window.setup_listeners = () => {
    $('#domenu-0 .item-edit').unbind().on('click', function(e) {

      console.log('clicked on.item-edit')
      // console.log(e)

    })
  }


});
