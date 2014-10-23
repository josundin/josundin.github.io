"use strict";
(function(_this){
"use strict";

    var demo_opt = function(){
        this.blur_size = 9;
        this.lap_thres = 10;//69;
        this.eigen_thres = 10;//35;

        this.train_pattern = function() {
           //Use this to take snapshot with webcamera
        };
    }

    _this['orbObj'] = function(w, h){

        var desLimit = 2000;

        // our point match structure
        var match_t = (function () {
            function match_t(screen_idx, pattern_lev, pattern_idx, distance) {
                if (typeof screen_idx === "undefined") { screen_idx=0; }
                if (typeof pattern_lev === "undefined") { pattern_lev=0; }
                if (typeof pattern_idx === "undefined") { pattern_idx=0; }
                if (typeof distance === "undefined") { distance=0; }

                this.screen_idx = screen_idx;
                this.pattern_lev = pattern_lev;
                this.pattern_idx = pattern_idx;
                this.distance = distance;
            }
            return match_t;
        })();

        var gui,options;
        var img_u8, img_u8_smooth, screen_corners, num_corners, screen_descriptors;
        var pattern_corners, pattern_descriptors, pattern_preview;
        var matches, good_matches, homo3x3, match_mask;
        var num_train_levels = 4;

        setup_app(w, h);

        function setup_app(w, h) {

            img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
            // after blur
            img_u8_smooth = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
            // we wll limit to n strongest points
            screen_descriptors = new jsfeat.matrix_t(32, desLimit, jsfeat.U8_t | jsfeat.C1_t);
            pattern_descriptors = [];

            screen_corners = [];
            pattern_corners = [];
            matches = [];

            var i = w*h;
            while(--i >= 0) {
                screen_corners[i] = new jsfeat.keypoint_t(0,0,0,0,-1);
                matches[i] = new match_t();
            }

            // transform matrix
            homo3x3 = new jsfeat.matrix_t(3,3,jsfeat.F32C1_t);
            match_mask = new jsfeat.matrix_t(desLimit,1,jsfeat.U8C1_t);

            options = new demo_opt();
        };

        function OrbOther(imageData, w, h) {
            var img2_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
         
            jsfeat.imgproc.grayscale(imageData.data, w, h, img2_u8);

            var lev=0, i=0;
            var sc = 1.0;
            var max_per_level = 450;
            var sc_inc = Math.sqrt(2.0); // magic number ;)
            var lev0_img = new jsfeat.matrix_t(img2_u8.cols, img2_u8.rows, jsfeat.U8_t | jsfeat.C1_t);
            var lev_img = new jsfeat.matrix_t(img2_u8.cols, img2_u8.rows, jsfeat.U8_t | jsfeat.C1_t);
            var new_width=0, new_height=0;
            var lev_corners, lev_descr;
            var corners_num=0;

            //scale factor = 1
            new_width = w;//(img2_u8.cols*sc0)|0;
            new_height = h;//= (img2_u8.rows*sc0)|0;
            good_matches = 0;

            jsfeat.imgproc.resample(img2_u8, lev0_img, new_width, new_height);

            // prepare preview
            pattern_preview = new jsfeat.matrix_t(new_width>>1, new_height>>1, jsfeat.U8_t | jsfeat.C1_t);
            jsfeat.imgproc.pyrdown(img2_u8, pattern_preview);

            for(lev=0; lev < num_train_levels; ++lev) {
                pattern_corners[lev] = [];
                lev_corners = pattern_corners[lev];

                // preallocate corners array
                i = (new_width*new_height) >> lev;
                while(--i >= 0) {
                    lev_corners[i] = new jsfeat.keypoint_t(0,0,0,0,-1);
                }

                pattern_descriptors[lev] = new jsfeat.matrix_t(32, max_per_level, jsfeat.U8_t | jsfeat.C1_t);
            }

            // do the first level
            lev_corners = pattern_corners[0];
            lev_descr = pattern_descriptors[0];

            // jsfeat.imgproc.gaussian_blur(lev0_img, lev_img, options.blur_size|0); // this is more robust
            jsfeat.imgproc.gaussian_blur(img2_u8, lev_img, options.blur_size|0); // this is more robust
            corners_num = detect_keypoints(lev_img, lev_corners, max_per_level);
            jsfeat.orb.describe(lev_img, lev_corners, corners_num, lev_descr);

            console.log("train " + lev_img.cols + "x" + lev_img.rows + " points: " + corners_num);

            sc /= sc_inc;

            // lets do multiple scale levels
            // we can use Canvas context draw method for faster resize 
            // but its nice to demonstrate that you can do everything with jsfeat
            for(lev = 1; lev < num_train_levels; ++lev) {
                lev_corners = pattern_corners[lev];
                lev_descr = pattern_descriptors[lev];

                new_width = (img2_u8.cols*sc)|0;
                new_height = (img2_u8.rows*sc)|0;

                jsfeat.imgproc.resample(img2_u8, lev_img, new_width, new_height);
                ////////////////////////////
                // console.log(lev_img.data);
                jsfeat.imgproc.gaussian_blur(lev_img, lev_img, options.blur_size|0);
                corners_num = detect_keypoints(lev_img, lev_corners, max_per_level);
                jsfeat.orb.describe(lev_img, lev_corners, corners_num, lev_descr);

                // fix the coordinates due to scale level
                for(i = 0; i < corners_num; ++i) {
                    lev_corners[i].x *= 1./sc;
                    lev_corners[i].y *= 1./sc;
                }

                console.log("train " + lev_img.cols + "x" + lev_img.rows + " points: " + corners_num);

                sc /= sc_inc;
            }
            findMatches()
        };

        function OrbBase(imageData, cwidth, cheight) {
            
            jsfeat.imgproc.grayscale(imageData.data, cwidth, cheight, img_u8);      
            jsfeat.imgproc.gaussian_blur(img_u8, img_u8_smooth, options.blur_size|0);
            
            jsfeat.yape06.laplacian_threshold = options.lap_thres|0;
            jsfeat.yape06.min_eigen_value_threshold = options.eigen_thres|0;

            num_corners = detect_keypoints(img_u8_smooth, screen_corners, desLimit);            
            jsfeat.orb.describe(img_u8_smooth, screen_corners, num_corners, screen_descriptors);
        };


        function findMatches(){
            // find matches
            var num_matches = 0;
            good_matches = 0;
            num_matches = match_pattern();
            good_matches = find_transform(matches, num_matches);
            console.log("nr matches", num_matches ,"nr Goooood", good_matches);
        };


        // UTILITIES

        function detect_keypoints(img, corners, max_allowed) {
            // detect features
            var count = jsfeat.yape06.detect(img, corners, 17);

            // sort by score and reduce the count if needed
            if(count > max_allowed) {
                jsfeat.math.qsort(corners, 0, count-1, function(a,b){return (b.score<a.score);});
                count = max_allowed;
            }

            // calculate dominant orientation for each keypoint
            for(var i = 0; i < count; ++i) {
                corners[i].angle = ic_angle(img, corners[i].x, corners[i].y);
            }

            return count;
        };

        // central difference using image moments to find dominant orientation
        var u_max = new Int32Array([15,15,15,15,14,14,14,13,13,12,11,10,9,8,6,3,0]);
        function ic_angle(img, px, py) {
            var half_k = 15; // half patch size
            var m_01 = 0, m_10 = 0;
            var src=img.data, step=img.cols;
            var u=0, v=0, center_off=(py*step + px)|0;
            var v_sum=0,d=0,val_plus=0,val_minus=0;
            
            // Treat the center line differently, v=0
            for (u = -half_k; u <= half_k; ++u)
                m_10 += u * src[center_off+u];
            
            // Go line by line in the circular patch
            for (v = 1; v <= half_k; ++v) {
                // Proceed over the two lines
                v_sum = 0;
                d = u_max[v];
                for (u = -d; u <= d; ++u) {
                    val_plus = src[center_off+u+v*step];
                    val_minus = src[center_off+u-v*step];
                    v_sum += (val_plus - val_minus);
                    m_10 += u * (val_plus + val_minus);
                }
                m_01 += v * v_sum;
            }
            
            return Math.atan2(m_01, m_10);
        };

        // estimate homography transform between matched points
        function find_transform(matches, count) {
            // motion kernel
            var mm_kernel = new jsfeat.motion_model.homography2d();
            // ransac params
            var num_model_points = 4;
            var reproj_threshold = 3;
            var ransac_param = new jsfeat.ransac_params_t(num_model_points, 
                                                          reproj_threshold, 0.5, 0.99);

            var pattern_xy = [];
            var screen_xy = [];

            // construct correspondences
            for(var i = 0; i < count; ++i) {
                var m = matches[i];
                var s_kp = screen_corners[m.screen_idx];
                var p_kp = pattern_corners[m.pattern_lev][m.pattern_idx];
                pattern_xy[i] = {"x":p_kp.x, "y":p_kp.y};
                screen_xy[i] =  {"x":s_kp.x, "y":s_kp.y};
            }

            // estimate motion
            var ok = false;
            ok = jsfeat.motion_estimator.ransac(ransac_param, mm_kernel, 
                                                pattern_xy, screen_xy, count, homo3x3, match_mask, 3500);

            // extract good matches and re-estimate
            var good_cnt = 0;
            if(ok) {
                for(var i=0; i < count; ++i) {
                    if(match_mask.data[i]) {
                        pattern_xy[good_cnt].x = pattern_xy[i].x;
                        pattern_xy[good_cnt].y = pattern_xy[i].y;
                        screen_xy[good_cnt].x = screen_xy[i].x;
                        screen_xy[good_cnt].y = screen_xy[i].y;
                        good_cnt++;
                    }
                }
                // run kernel directly with inliers only
                mm_kernel.run(pattern_xy, screen_xy, homo3x3, good_cnt);
            } else {
                jsfeat.matmath.identity_3x3(homo3x3, 1.0);
            }

            return good_cnt;
        };

        // non zero bits count
        function popcnt32(n) {
            n -= ((n >> 1) & 0x55555555);
            n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
            return (((n + (n >> 4))& 0xF0F0F0F)* 0x1010101) >> 24;
        };

        // naive brute-force matching.
        // each on screen point is compared to all pattern points
        // to find the closest match
        function match_pattern() {
            var q_cnt = screen_descriptors.rows;
            var query_du8 = screen_descriptors.data;
            var query_u32 = screen_descriptors.buffer.i32; // cast to integer buffer
            var qd_off = 0;
            var qidx=0,lev=0,pidx=0,k=0;
            var num_matches = 0;

            for(qidx = 0; qidx < q_cnt; ++qidx) {
                var best_dist = 256;
                var best_dist2 = 256;
                var best_idx = -1;
                var best_lev = -1;

                for(lev = 0; lev < num_train_levels; ++lev) {
                    var lev_descr = pattern_descriptors[lev];
                    var ld_cnt = lev_descr.rows;
                    var ld_i32 = lev_descr.buffer.i32; // cast to integer buffer
                    var ld_off = 0;

                    for(pidx = 0; pidx < ld_cnt; ++pidx) {

                        var curr_d = 0;
                        // our descriptor is 32 bytes so we have 8 Integers
                        for(k=0; k < 8; ++k) {
                            curr_d += popcnt32( query_u32[qd_off+k]^ld_i32[ld_off+k] );
                        }

                        if(curr_d < best_dist) {
                            best_dist2 = best_dist;
                            best_dist = curr_d;
                            best_lev = lev;
                            best_idx = pidx;
                        } else if(curr_d < best_dist2) {
                            best_dist2 = curr_d;
                        }

                        ld_off += 8; // next descriptor
                    }
                }

                // filter using the ratio between 2 closest matches
                if(best_dist < 0.8*best_dist2) {
                    matches[num_matches].screen_idx = qidx;
                    matches[num_matches].pattern_lev = best_lev;
                    matches[num_matches].pattern_idx = best_idx;
                    num_matches++;
                }
                //

                qd_off += 8; // next query descriptor
            }

            return num_matches;
        };

        // END UTILITIES

        return {
            setOrbBase: function(imgBaseData, cwidth, cheight){
                OrbBase(imgBaseData, cwidth, cheight);
            },

            setOrbOther: function(imgOtherData, w, h){
                OrbOther(imgOtherData, w, h);
            },

            getNumMatches: function(){
                return good_matches;
            },
            getHomograph: function(){
                var H = [];
                var homo3x3T = new jsfeat.matrix_t(3,3,jsfeat.F32C1_t);

                jsfeat.matmath.invert_3x3(homo3x3, homo3x3T);

                for (var i = 0; i < homo3x3.data.length - 1; i++){
                    H[i] = homo3x3T.data[i];
                };

                return H;
            }
        };
    };
}(this));
