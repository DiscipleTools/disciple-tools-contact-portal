<?php
$post_id = $this->parts["post_id"];
$post = DT_Posts::get_post( $this->post_type, $post_id, true, false );
if ( is_wp_error( $post ) ){
    return;
}
?>


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
            <div class="cell"><a href="<?php echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/' ?>"><h3>Groups</h3></a></div>
            <div class="cell"><a href="<?php echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/map' ?>"><h3>Map</h3></a></div>
            <br><br>
            <div class="cell"><a href="<?php echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/help' ?>"><i class="fi-info" style="font-size:1.5rem;"></i> </a></div>
<!--            <div class="cell"><a href="--><?php //echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/people' ?><!--"><h3>People</h3></a></div>-->
<!--            <div class="cell"><a href="--><?php //echo site_url() . '/' . $this->parts['root'] . '/' . $this->parts['type'] . '/' . $this->parts['public_key'] . '/pace' ?><!--"><h3>Pace</h3></a></div>-->
        </div>
    </div>
</div>
