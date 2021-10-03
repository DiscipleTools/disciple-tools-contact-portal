<?php
$post_id = $this->parts["post_id"];
$post = DT_Posts::get_post( $this->post_type, $post_id, true, false );
if ( is_wp_error( $post ) ){
    return;
}
$fields = DT_Posts::get_post_field_settings( $this->post_type );
?>


<div id="custom-style"></div>
<!-- title -->
<div class="grid-x">
    <div class="cell padding-1" >
        <button type="button" style="margin:1em;" data-open="offCanvasLeft"><i class="fi-list" style="font-size:2em;"></i></button>
        <span class="loading-spinner active" style="float:right;margin:10px;"></span><!-- javascript container -->
    </div>
</div>

<!-- off canvas menus -->
<div class="off-canvas-wrapper">
    <!-- Left Canvas -->
    <div class="off-canvas position-left" id="offCanvasLeft" data-off-canvas data-transition="push">
        <button class="close-button" aria-label="Close alert" type="button" data-close>
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="grid-x grid-padding-x center">
            <div class="cell " style="padding-top: 1em;"><h2><?php echo esc_html( $post['title'] ?? '' ) ?></h2></div>
            <div class="cell"><hr></div>
            <div class="cell"><a href="<?php echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/groups' ?>"><h3>Groups</h3></a></div>
            <div class="cell"><a href="<?php echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/people' ?>"><h3>People</h3></a></div>
            <div class="cell"><a href="<?php echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/map' ?>"><h3>Maps</h3></a></div>
            <div class="cell"><a href="<?php echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/pace' ?>"><h3>Pace</h3></a></div>
        </div>
    </div>
</div>

<div id="wrapper"></div>
<div class="dd" id="domenu-0">
    <button class="dd-new-item">+</button>
    <li class="dd-item-blueprint" id="" data-pparent="domenu-0">
        <button class="collapse" data-action="collapse" type="button" style="display: none;">–</button>
        <button class="expand" data-action="expand" type="button" style="display: none;">+</button>
        <div class="dd-handle dd3-handle">&nbsp;</div>
        <div class="dd3-content">
            <div class="item-name">[item_name]</div>
            <div class="dd-button-container">
                <button class="item-edit" >✎</button>
                <button class="item-add">+</button>
                <button class="item-remove">&times;</button>
            </div>
            <div class="dd-edit-box" style="display: none;">
                <input type="text" name="title" autocomplete="off" placeholder="Item"
                       data-placeholder="Any nice idea for the title?"
                       data-default-value="Unsaved Group {?numeric.increment}">

            </div>
        </div>
    </li>
    <ol class="dd-list"></ol>
</div>

