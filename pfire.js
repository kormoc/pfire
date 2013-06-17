(function($) {
    'use strict';
    $.pfire = function(element, options) {
        var defaults = {
            'gravity':              0.5,
            // Colors for particles?
            'colors':               'global',
            // Trail life
            'trail':                0.05,
            // Update Speed
            'fps':                  16,
            'color': {
                'r':                (Math.random() * 255) >> 0,
                'g':                (Math.random() * 255) >> 0,
                'b':                (Math.random() * 255) >> 0
            },
            'max_velocity':         2,
            'velocity_multiplier':  1,
            'in_air_height':        50,
            'W':                    undefined,
            'H':                    undefined,
            'particles':            undefined
        };

        var plugin = this;

        plugin.settings = {};

        var $element = $(element);

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);

            if (!plugin.settings.W) {
                plugin.settings.W = $element.width;
            }
            if (!plugin.settings.H) {
                plugin.settings.H = $element.height;
            }

            plugin.updateSize(plugin.settings.W, plugin.settings.H);

            plugin.particles = [];
            plugin.ctx = element.getContext("2d");

            // Init some settings
            plugin.setGravity();

            // Clear canvas
            plugin.ctx.globalCompositeOperation = "destination-over";
            plugin.ctx.fillStyle = "rgba(0, 0, 0, 1)";
            plugin.ctx.fillRect(0, 0, plugin.settings.W, plugin.settings.H);

            if (plugin.settings.particles) {
                plugin.addParticles(plugin.settings.particles);
            }


            // Start rendering
            plugin.interval = setInterval(function() { plugin.draw(); }, plugin.settings.fps);

            $element.click(function(event) {
                var target = event.target || event.srcElement;
                var x = event.pageX - target.offsetLeft;
                var y = event.pageY - target.offsetTop;
                plugin.starburst(x, y);
            });

        };

        plugin.addParticle = function() {
            plugin.particles.push(new plugin.particle(plugin));
            plugin.settings.particles += 1;
        };

        plugin.addParticles = function(count) {
            for(var i = 0; i < count; i++) {
                plugin.addParticle();
            }
            plugin.settings.particles += count;
        };

        plugin.setParticles = function(count) {
            while (plugin.particles.length > count) {
                plugin.particles.pop();
            }
            while (plugin.particles.length < count) {
                plugin.addParticle();
            }

            plugin.settings.particles = count;
        };

        plugin.draw = function() {
            plugin.ctx.globalCompositeOperation = "darker";
            plugin.ctx.fillStyle = "rgba(0, 0, 0, "+plugin.settings.trail+")";
            plugin.ctx.fillRect(0, 0, plugin.settings.W, plugin.settings.H);

            plugin.ctx.globalCompositeOperation = "lighter";

            var inair = 0;

            for(var t = 0; t < plugin.particles.length; t++)
            {
                var p = plugin.particles[t];
                p.draw(plugin.ctx);
                p.move();
                p.updateColor();

                if (t === 0) {
                    plugin.settings.color = p.color;
                }

                if (p.y < plugin.settings.H - plugin.settings.in_air_height) {
                    inair = 1;
                }
            }

            if (inair === 0) {
                if (Math.random() * 2>>0 === 0) {
                    plugin.starburst();
                }
                else {
                    plugin.randomize();
                }
            }
        };

        plugin.starburst = function(x, y) {
            if (!x) {
                x = Math.random() * plugin.settings.W>>0;
            }
            if (!y) {
                y = Math.random() * plugin.settings.H>>0;
            }
            var d = 0;
            var di = 360 / plugin.particles.length;

            for(var t = 0; t < plugin.particles.length; t++) {
                var p = plugin.particles[t];
                p.x = x;
                p.y = y;
                p.direction = d;
                d += di;
                p.setVelocity(Math.random() * 2);
            }
        };

        plugin.randomize = function() {
            for(var t = 0; t < plugin.particles.length; t++) {
                var p = plugin.particles[t];
                p.x = Math.random() * plugin.settings.W>>0;
                p.y = Math.random() * plugin.settings.H>>0;
                p.direction = Math.random() * 360;
                p.setVelocity(Math.random() * 2);
            }
        };

        plugin.updateSize = function(W, H) {
            element.style.width = W+"px";
            element.style.height = H+"px";

            W *= window.devicePixelRatio;
            H *= window.devicePixelRatio;

            plugin.settings.W = W;
            plugin.settings.H = H;

            element.width = W;
            element.height = H;
        };

        plugin.setGravity = function(gravity) {
            if (gravity) {
                plugin.settings.gravity = gravity;
            }
            plugin.settings.gpf = plugin.settings.gravity / (1000 / plugin.settings.fps);
        };

        plugin.particle = function(plugin) {
            this.x = Math.random()*plugin.settings.W>>0;
            this.y = Math.random()*plugin.settings.H>>0;

            // Degree of direction
            // 0-360
            this.direction = Math.random()*360>>0;

            this.color = {
                'r': Math.random()*255>>0,
                'g': Math.random()*255>>0,
                'b': Math.random()*255>>0,
            };

            this.size = 2 * window.devicePixelRatio;

            // Speed
            this.setVelocity = function(velocity) {
                this.velocity = velocity;
                this.vx = this.velocity * Math.cos(this.direction);
                this.vy = this.velocity * Math.sin(this.direction);
            };

            this.setVelocity(1);

            this.getColor = function() {
                if (plugin.settings.colors === 'global') {
                    return "rgba("+plugin.settings.color.r+", "+plugin.settings.color.g+", "+plugin.settings.color.b+", 0.5)";
                }
                else {
                    return "rgba("+this.color.r+", "+this.color.g+", "+this.color.b+", 0.5)";
                }
            };

            this.move = function() {
                this.x += this.vx * plugin.settings.velocity_multiplier;
                this.y += this.vy * plugin.settings.velocity_multiplier;

                this.vy += plugin.settings.gpf;

                if (this.x < 0) {
                    this.x = Math.abs(this.x);
                    this.vx *= -0.75;
                    this.direction = (2*270-this.direction-180);
                }
                if (this.x > plugin.settings.W) {
                    this.x = plugin.settings.W - (this.x - plugin.settings.W);
                    this.vx *= -0.75;
                    this.direction = (2*90-this.direction-180);
                }

                if (this.y < 0) {
                    this.y = Math.abs(this.y);
                    this.vy *= -0.75;
                    this.direction = (2*180-this.direction-180);
                }
                if (this.y > plugin.settings.H) {
                    this.y = plugin.settings.H - (this.y - plugin.settings.H);
                    this.vy *= -0.75;
                    this.direction = (2*0-this.direction-180);
                }

                if (this.direction < 0) {
                    this.direction += 360;
                }
                if (this.direction > 360) {
                    this.direction %= 360;
                }

                if (this.vx > plugin.settings.max_velocity) {
                    this.vx = plugin.settings.max_velocity;
                }
                if (this.vx < 0-plugin.settings.max_velocity) {
                    this.vx = 0-plugin.settings.max_velocity;
                }

                if (this.vy > plugin.settings.max_velocity) {
                    this.vy = plugin.settings.max_velocity;
                }
                if (this.vy < 0-plugin.settings.max_velocity) {
                    this.vy = 0-plugin.settings.max_velocity;
                }
            };

            this.draw = function(ctx) {
                ctx.beginPath();
                var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, this.getColor());
                gradient.addColorStop(1, "black");

                ctx.fillStyle = gradient;
                ctx.arc(this.x, this.y, this.size, Math.PI*2, false);
                ctx.fill();
            };

            this.updateColor = function() {
                if (Math.random()*3>>0) {
                    this.color.r = this.color.r + (Math.random()*7>>0)-3;
                }

                if (Math.random()*3>>0) {
                    this.color.g = this.color.g + (Math.random()*7>>0)-3;
                }

                if (Math.random()*3>>0) {
                    this.color.b = this.color.b + (Math.random()*7>>0)-3;
                }

                if (this.color.r < 90) {
                    this.color.r = 90;
                }
                if (this.color.r > 255) {
                    this.color.r = 255;
                }

                if (this.color.g < 90) {
                    this.color.g = 90;
                }
                if (this.color.g > 255) {
                    this.color.g = 255;
                }

                if (this.color.g < 90) {
                    this.color.g = 90;
                }
                if (this.color.g > 255) {
                    this.color.g = 255;
                }
            };
        };

        plugin.init();
    };

    // add the plugin to the jQuery.fn object
    $.fn.pfire = function(options) {
        return this.each(function() {
            if (undefined === $(this).data('pfire')) {
                var plugin = new $.pfire(this, options);
                $(this).data('pfire', plugin);
            }
        });
    };
})(jQuery);
