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
        <span class="loading-spinner" style="float:right;margin:10px;"></span><!-- javascript container -->
    </div>
</div>

<!-- off canvas menus -->
<div class="off-canvas-wrapper">
    <!-- Left Canvas -->
    <div class="off-canvas position-left" id="offCanvasLeft" data-off-canvas data-transition="push">
        <button class="close-button" aria-label="Close alert" type="button" data-close>
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="grid-x grid-padding-x">
            <div class="cell center" style="padding-top: 1em;"><h2><?php echo esc_html( $post['title'] ) ?></h2></div>
            <div class="cell"><hr></div>
        </div>
    </div>
</div>

<div id="wrapper">

</div>
