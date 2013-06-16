function particle(pfire) {
    this.x = Math.random()*pfire.W>>0;
    this.y = Math.random()*pfire.H>>0;
    
    // Degree of direction
    // 0-360
    this.direction = Math.random()*360>>0;
    
    // Speed
    this.velocity = 1;
    
    // Mass for gravity
    this.mass = 0;
    
    this.color = {
        'r': Math.random()*255>>0,
        'g': Math.random()*255>>0,
        'b': Math.random()*255>>0,
    }
    
    this.size = 2;
    
    this.getcolor = function() {
        if (pfire.world.colors == 'global')
            return "rgba("+pfire.world.color.r+", "+pfire.world.color.g+", "+pfire.world.color.b+", 0.5)";
        else
            return "rgba("+this.color.r+", "+this.color.g+", "+this.color.b+", 0.5)";
    }
    
    this.move = function() {
        this.x = this.x + (this.velocity * Math.sin(this.direction * Math.PI / 180));
        this.y = this.y + (this.velocity * Math.cos(this.direction * Math.PI / 180));
        
        if (this.x < 0) {
            this.x = Math.abs(this.x);
            this.direction = (2*270-this.direction-180);
        }
        if (this.x > pfire.W) {
            this.x = pfire.W - (this.x - pfire.W);
            this.direction = (2*90-this.direction-180);
        }
        
        if (this.y < 0) {
            this.y = Math.abs(this.y);
            this.direction = (2*180-this.direction-180);
        }
        if (this.y > pfire.H) {
            this.y = pfire.H - (this.y - pfire.H);
            this.direction = (2*0-this.direction-180);
        }
        
        // Gravity
        if (this.direction > 0 && this.direction < 180)
            this.direction -= pfire.world.gpf;
        else if (this.direction >= 180 && this.direction < 360)
            this.direction += pfire.world.gpf;
        
        if (this.direction >= 90 && this.direction <= 270) {
            if (this.velocity > 0) {
                this.velocity -= pfire.world.gpf;
            }
            else {
                this.velocity += pfire.world.gpf;
                this.direction = (2*0-this.direction-180);
            }
        }
        else
            this.velocity += pfire.world.gpf;
        
        if (this.direction < 0) {
            this.direction += 360;
        }
        if (this.direction > 360) {
            this.direction %= 360;
        }
        
        this.velocity -= pfire.world.air_resistance;
        
        if (this.velocity > pfire.world.max_velocity)
            this.velocity = pfire.world.max_velocity;
        if (this.velocity < 0)
            this.velocity = 0;
        
    }
    
    this.draw = function(ctx) {
        ctx.beginPath();
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
		gradient.addColorStop(0, this.getcolor());
		gradient.addColorStop(1, "black");
		
		ctx.fillStyle = gradient;
		ctx.arc(this.x, this.y, this.size, Math.PI*2, false);
		ctx.fill();
    }
    
    this.updatecolor = function() {
        if (Math.random()*3>>0)
            this.color.r = this.color.r + (Math.random()*7>>0)-3;
            
        if (Math.random()*3>>0)
            this.color.g = this.color.g + (Math.random()*7>>0)-3;
            
        if (Math.random()*3>>0)
            this.color.b = this.color.b + (Math.random()*7>>0)-3;
        
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
    }
}


function pfire(canvas, options) {
    this.canvas = $(canvas).get(0);
    this.ctx = this.canvas.getContext("2d");
    
    //Canvas dimensions
    this.W = this.canvas.width;
    this.H = this.canvas.height;
    this.particles = [];
    this.MAX_PARTICLES = 1;
    
    this.world = {
        'gravity':          options.gravity         || 1,
        'air_resistance':   options.air_resistance  || 0.01,
        // Colors for particles?
        'colors':           options.colors          || 'global',
        // Trail life
        'trail':            options.trail           || 0.05,
        // Update Speed
        'fps':              options.fps             || 33,
        'color':            options.color           || {
            'r': Math.random()*255>>0,
            'g': Math.random()*255>>0,
            'b': Math.random()*255>>0,
        },
        'max_velocity':     options.max_velocity    || 2,
    }
    
    // Calculate the gravity per frame
    this.world.gpf = this.world.gravity / (1000 / this.world.fps);
    
    // Clear canvas
    this.ctx.globalCompositeOperation = "destination-over";
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.W, this.H);
    
    this.addParticle = function() {
        this.particles.push(new particle(this));
    }
    
    this.addParticles = function(count) {
        for(var i = 0; i < count; i++)
            this.addParticle();
    }
    
    this.draw = function() {
        this.ctx.globalCompositeOperation = "darker";
        this.ctx.fillStyle = "rgba(0, 0, 0, "+this.world.trail+")";
        this.ctx.fillRect(0, 0, this.W, this.H);
    
        this.ctx.globalCompositeOperation = "lighter";
    
        for(var t = 0; t < this.particles.length; t++)
        {
            var p = this.particles[t];
            p.draw(this.ctx);
            p.move();
            p.updatecolor();
        
            if (t == 0)
                this.world.color = p.color;
        }
    }
    
    this.starburst = function() {
        x = Math.random() * this.W>>0;
        y = Math.random() * this.H>>0;
        d = 0;
        di = 360 / this.particles.length;
        
        for(var t = 0; t < this.particles.length; t++) {
            var p = this.particles[t];
            p.x = x;
            p.y = y;
            p.direction = d;
            d += di;
            p.velocity = 1;
        }
    }
    
    this.randomize = function() {
        for(var t = 0; t < this.particles.length; t++) {
            var p = this.particles[t];
            p.x = Math.random() * this.W>>0;
            p.y = Math.random() * this.H>>0;
            p.direction = Math.random() * 360;
            p.velocity = 1;
        }
    }
    
    var self = this;
    
    this.interval = setInterval(function() { self.draw(); }, this.world.fps);
}


