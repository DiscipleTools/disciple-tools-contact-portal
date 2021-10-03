<?php
if ( !defined( 'ABSPATH' ) ) { exit; } // Exit if accessed directly.


/**
 * Class DT_Contact_Portal_Magic_Link
 */
class DT_Contact_Portal_Magic_Link extends DT_Magic_Url_Base {

    public $magic = false;
    public $parts = false;
    public $page_title = 'Portal';
    public $root = "portal_app";
    public $type = 'c';
    public $post_type = 'contacts';
    private $meta_key = '';
    public $type_actions = [
        '' => "Groups",
        'groups' => "Groups",
        'people' => "People",
        'prayer' => "prayer",
        'map' => "Map",
        'pace' => "Pace",
    ];

    private static $_instance = null;
    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    } // End instance()

    public function __construct() {
        $this->meta_key = $this->root . '_' . $this->type . '_magic_key';
        parent::__construct();

        /**
         * post type and module section
         */
        add_action( 'dt_details_additional_section', [ $this, 'dt_details_additional_section' ], 30, 2 );
        add_filter( 'dt_details_additional_tiles', [ $this, 'dt_details_additional_tiles' ], 10, 2 );
        add_action( 'rest_api_init', [ $this, 'add_endpoints' ] );

        /**
         * tests if other URL
         */
        $url = dt_get_url_path();
        if ( strpos( $url, $this->root . '/' . $this->type ) === false ) {
            return;
        }
        /**
         * tests magic link parts are registered and have valid elements
         */
        if ( !$this->check_parts_match() ){
            return;
        }

        // load if valid url
        add_action( 'dt_blank_body', [ $this, 'body' ] ); // body for no post key
        add_filter( 'dt_magic_url_base_allowed_css', [ $this, 'dt_magic_url_base_allowed_css' ], 10, 1 );
        add_filter( 'dt_magic_url_base_allowed_js', [ $this, 'dt_magic_url_base_allowed_js' ], 10, 1 );
        add_action( 'wp_enqueue_scripts', [ $this, 'scripts' ], 99 );
    }

    public function dt_magic_url_base_allowed_js( $allowed_js ) {
        $allowed_js[] = 'portal-app-'.$this->type.'-js';
        $allowed_js[] = 'jquery-touch-punch';
        $allowed_js[] = 'portal-app-domenu-js';
        $allowed_js[] = 'mapbox-gl';
        return $allowed_js;
    }

    public function dt_magic_url_base_allowed_css( $allowed_css ) {
        $allowed_css[] = 'portal-app-'.$this->type.'-css';
        $allowed_css[] = 'mapbox-gl-css';
        $allowed_css[] = 'portal-app-domenu-css';
        return $allowed_css;
    }

    public function scripts() {
        wp_register_script( 'jquery-touch-punch', '/wp-includes/js/jquery/jquery.ui.touch-punch.js' ); // @phpcs:ignore

        wp_enqueue_script( 'portal-app-'.$this->type.'-js', trailingslashit( plugin_dir_url( __FILE__ ) ) . 'portal-app.js', [ 'jquery' ],
            filemtime( trailingslashit( plugin_dir_path( __FILE__ ) ) .'portal-app.js' ), true );

        wp_enqueue_style( 'portal-app-'.$this->type.'-css', trailingslashit( plugin_dir_url( __FILE__ ) ) . 'portal-app.css', [],
            filemtime( trailingslashit( plugin_dir_path( __FILE__ ) ) .'portal-app.css' ) );

        wp_enqueue_script( 'portal-app-domenu-js', trailingslashit( plugin_dir_url( __FILE__ ) ) . 'jquery.domenu-0.100.77.min.js', [ 'jquery' ],
            filemtime( trailingslashit( plugin_dir_path( __FILE__ ) ) .'jquery.domenu-0.100.77.min.js' ), true );

        wp_enqueue_style( 'portal-app-domenu-css', trailingslashit( plugin_dir_url( __FILE__ ) ) . 'jquery.domenu-0.100.77.css', [],
            filemtime( trailingslashit( plugin_dir_path( __FILE__ ) ) .'jquery.domenu-0.100.77.css' ) );

    }

    /**
     * Writes javascript to the footer
     *
     * @see DT_Magic_Url_Base()->footer_javascript() for default state
     */
    public function footer_javascript(){
        $post_id = $this->parts["post_id"];
        $post = DT_Posts::get_post( $this->post_type, $post_id, true, false );
        if ( is_wp_error( $post ) ){
            return;
        }
        ?>
        <script>
            let jsObject = [<?php echo json_encode([
                'map_key' => DT_Mapbox_API::get_key(),
                'root' => esc_url_raw( rest_url() ),
                'nonce' => wp_create_nonce( 'wp_rest' ),
                'parts' => $this->parts,
                'post' => $post,
                'translations' => [
                    'add' => __( 'Add Magic', 'disciple-tools-contact-portal' ),
                ],
            ]) ?>][0]
        </script>
        <?php
    }

    /**
     * Post Type Tile Examples
     */
    public function dt_details_additional_tiles( $tiles, $post_type = "" ) {
        if ( $post_type === $this->post_type ){
            $tiles["dt_contact_portal"] = [
                "label" => __( "Portal", 'disciple-tools-contact-portal' ),
                "description" => "The Portal sets up a page accessible without authentication, only the link is needed. Useful for small applications liked to this record, like quick surveys or updates."
            ];
        }
        return $tiles;
    }

    public function dt_details_additional_section( $section, $post_type ) {
        // test if campaigns post type and campaigns_app_module enabled
        if ( $post_type === $this->post_type ) {
            if ( 'dt_contact_portal' === $section ) {
                $record = DT_Posts::get_post( $post_type, get_the_ID() );
                if ( isset( $record[$this->meta_key] )) {
                    $key = $record[$this->meta_key];
                } else {
                    $key = dt_create_unique_key();
                    update_post_meta( get_the_ID(), $this->meta_key, $key );
                }
                $link = DT_Magic_URL::get_link_url( $this->root, $this->type, $key )
                ?>
                <a class="button" href="<?php echo esc_html( $link ); ?>" target="_blank">Open Link</a>
                <a class="button" id="open-portal-activity" style="cursor:pointer;">Open Activity</a>
                <script>
                    jQuery(document).ready(function(){
                        jQuery('#open-portal-activity').on('click', function(e){
                            jQuery('#modal-full-title').empty().html(`Portal Activity`)
                            jQuery('#modal-full-content').empty().html(`content`) // @todo add content logic

                            jQuery('#modal-full').foundation('open')
                        })
                    })
                </script>
                <?php
            }
        }
    }

    public function body(){
        DT_Mapbox_API::geocoder_scripts();
        require_once('portal-app-html.php');
    }

    /**
     * Register REST Endpoints
     * @link https://github.com/DiscipleTools/disciple-tools-theme/wiki/Site-to-Site-Link for outside of wordpress authentication
     */
    public function add_endpoints() {
        $namespace = $this->root . '/v1';
        register_rest_route(
            $namespace, '/'.$this->type, [
                [
                    'methods'  => "GET",
                    'callback' => [ $this, 'endpoint_get' ],
                    'permission_callback' => function( WP_REST_Request $request ){
                        $magic = new DT_Magic_URL( $this->root );
                        return $magic->verify_rest_endpoint_permissions_on_post( $request );
                    },
                ],
            ]
        );
        register_rest_route(
            $namespace, '/'.$this->type, [
                [
                    'methods'  => "POST",
                    'callback' => [ $this, 'update_record' ],
                    'permission_callback' => function( WP_REST_Request $request ){
                        $magic = new DT_Magic_URL( $this->root );
                        return $magic->verify_rest_endpoint_permissions_on_post( $request );
                    },
                ],
            ]
        );
    }

    public function endpoint_get( WP_REST_Request $request ) {
        $params = $request->get_params();
        if ( ! isset( $params['parts'], $params['action'] ) ) {
            return new WP_Error( __METHOD__, "Missing parameters", [ 'status' => 400 ] );
        }

        $tree = [];
        $title_list = [];
        $pre_tree = [];
        $post_id = $params["parts"]["post_id"];
        $list = DT_Posts::list_posts('groups', [
            'fields_to_return' => [  ],
            'coaches' => [ $post_id ]
        ], false );

        if ( ! empty( $list['posts'] ) ) {
            foreach( $list['posts'] as $p ) {
                if ( isset( $p['child_groups'] ) && ! empty( $p['child_groups'] ) ) {
                    foreach( $p['child_groups'] as $children ) {
                        $pre_tree[$children['ID']] = $p['ID'];
                    }
                }
                if (  empty( $p['parent_groups'] ) ) {
                    $pre_tree[$p['ID']] = null;
                }
                $title_list[$p['ID']] = $p['name'];
            }
            $tree = $this->parse_tree($pre_tree, $title_list);
        }

        if ( is_null( $tree) ) {
            $tree = [];
        }

        return [
            'parent_list' => $pre_tree,
            'title_list' => $title_list,
            'tree' => $tree
        ];
    }

    /**
     * @see https://stackoverflow.com/questions/2915748/convert-a-series-of-parent-child-relationships-into-a-hierarchical-tree
     *
     * @param $tree
     * @param null $root
     * @return array|null
     */
    public function parse_tree($tree, $title_list, $root = null) {
        $return = array();
        # Traverse the tree and search for direct children of the root
        foreach($tree as $child => $parent) {
            # A direct child is found
            if($parent == $root) {
                # Remove item from tree (we don't need to traverse this again)
                unset($tree[$child]);
                # Append the child into result array and parse its children
                $return[] = array(
                    'id' => $child,
                    'title' => $child,
                    'name' => $title_list[$child] ?? 'No Name',
                    'children' => $this->parse_tree($tree, $title_list, $child),
                    '__domenu_params' => []
                );
            }
        }
        return empty($return) ? null : $return;
    }


    public function update_record( WP_REST_Request $request ) {
        $params = $request->get_params();
        if ( ! isset( $params['parts'], $params['action'] ) ) {
            return new WP_Error( __METHOD__, "Missing parameters", [ 'status' => 400 ] );
        }
        $params = dt_recursive_sanitize_array( $params );

        $post_id = $params["parts"]["post_id"]; //has been verified in verify_rest_endpoint_permissions_on_post()
        $post = DT_Posts::get_post( $this->post_type, $post_id, true, false );

        $args = [];
        if ( !is_user_logged_in() ){
            $args["comment_author"] = $post['name'];
            wp_set_current_user( 0 );
            $current_user = wp_get_current_user();
            $current_user->add_cap( "create_contact" );
            $current_user->display_name = $post['name'];
        }

        switch( $params['action'] ) {
            case 'onItemAdded':
                dt_write_log('onItemAdded');
                $fields = [
                    "title" => $params['data']['title'],
                    "group_status" => "active",
                    "group_type" => "group",
                    "coaches" => [
                        "values" => [
                            [ "value" => $post_id ]
                        ]
                    ]
                ];
                $new_post = DT_Posts::create_post('groups', $fields, true, false );
                if ( ! is_wp_error( $new_post ) ) {
                    return [
                        'ID' => $new_post['ID'],
                        'title' => $new_post['post_title'],
                    ];
                }
                else {
                    dt_write_log($new_post);
                    return false;
                }

            case 'onItemCreated':
                dt_write_log('onItemCreated');
                $fields = [
                    "title" => $params['data']['title'],
                    "group_status" => "active",
                    "group_type" => "group",
                    "coaches" => [
                        "values" => [
                            [ "value" => $post_id ]
                        ]
                    ]
                ];
                $new_post = DT_Posts::create_post('groups', $fields, true, false );
                if ( ! is_wp_error( $new_post ) ) {
                    return [
                        'ID' => $new_post['ID'],
                        'title' => $new_post['title'],
                    ];
                }
                else {
                    dt_write_log($new_post);
                    return false;
                }

            case 'onItemAddChildItem':
                dt_write_log('onItemAddChildItem');
                $fields = [
                    "title" => $params['data']['title'],
                    "group_status" => "active",
                    "group_type" => "group",
                    "coaches" => [
                        "values" => [
                            [ "value" => $post_id ]
                        ]
                    ],
                    "parent_group" => [
                        "values" => [
                            [ "value" => $params['data']['parent_id'] ]
                        ]
                    ]
                ];
                $new_post = DT_Posts::create_post('groups', $fields, true, false );
                if ( ! is_wp_error( $new_post ) ) {
                    return [
                        'ID' => $new_post['ID'],
                        'title' => $new_post['title'],
                        'parent_id' => $new_post['parent_group'][0]['ID'] ?? $params['data']['parent_id'] ?? 0
                    ];
                 }
                else {
                    dt_write_log($new_post);
                    return false;
                }

            case 'onItemRemoved':
                dt_write_log('onItemRemoved');
                $deleted_post = Disciple_Tools_Posts::delete_post( 'groups', $params['data']['id'], false );
                if ( ! is_wp_error( $deleted_post ) ) {
                    return true;
                }
                else {
                    return false;
                }
            case 'onItemDrop':
                dt_write_log('onItemDrop');
                if( ! isset( $params['data']['new_parent'], $params['data']['self'], $params['data']['previous_parent'] ) ) {
                    dt_write_log('Defaults not found');
                    return false;
                }

                global $wpdb;
                if ( 'domenu-0' !== $params['data']['previous_parent'] ) {
                    $wpdb->query( $wpdb->prepare(
                        "DELETE
                                FROM $wpdb->p2p
                                WHERE p2p_from = %s
                                  AND p2p_to = %s
                                  AND p2p_type = 'groups_to_groups'", $params['data']['self'], $params['data']['previous_parent'] ) );
                }
                // add parent child
                $wpdb->query( $wpdb->prepare(
                    "INSERT INTO $wpdb->p2p (p2p_from, p2p_to, p2p_type)
                            VALUES (%s, %s, 'groups_to_groups');
                    ", $params['data']['self'], $params['data']['new_parent'] ) );
                return true;
        }
        return false;
    }
}
DT_Contact_Portal_Magic_Link::instance();
