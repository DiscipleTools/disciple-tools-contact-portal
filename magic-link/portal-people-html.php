<!-- title -->
<div class="grid-x">
    <div class="cell padding-1" >
        <button type="button" style="margin:1em;" data-open="offCanvasLeft"><i class="fi-list" style="font-size:2em;"></i></button>
        <span style="font-size:1.5rem;font-weight: bold;">Generational Coaching</span>
        <span class="loading-spinner active" style="float:right;margin:10px;"></span><!-- javascript container -->
    </div>
</div>

<!-- nav -->
<?php require_once ( 'portal-nav.php' ) ?>

<div id="wrapper">
    <div class="dd" id="domenu-0">
        <button class="dd-new-item">+</button>
        <li class="dd-item-blueprint" id="" data-prev_parent="domenu-0">
            <button class="collapse" data-action="collapse" type="button" style="display: none;">–</button>
            <button class="expand" data-action="expand" type="button" style="display: none;">+</button>
            <div class="dd-handle dd3-handle">&nbsp;</div>
            <div class="dd3-content">
                <div class="item-name">[item_name]</div>
                <div class="dd-button-container">
                    <button class="item-edit">✎</button>
                    <button class="item-add">+</button>
                    <button class="item-remove" style="display:none;">&times;</button>
                </div>
                <div class="dd-edit-box" style="display: none;">
                    <input type="text" name="title" autocomplete="off" placeholder="Item"
                           data-placeholder="Any nice idea for the title?"
                           data-default-value="Saving New Group {?numeric.increment}">
                </div>
            </div>
        </li>
        <ol class="dd-list"></ol>
    </div>
</div>

<div class="reveal large" id="edit-modal" data-v-offset="0" data-reveal>
    <div id="modal-title"></div>
    <div id="modal-content"></div>
    <button class="close-button" data-close aria-label="Close modal" type="button">
        <span aria-hidden="true">&times;</span>
    </button>
</div>

