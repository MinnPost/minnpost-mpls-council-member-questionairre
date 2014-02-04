/**
 * Some core functionality for minnpost applications
 */

/**
 * Global variable to hold the "application", templates, and data.
 */
var mpApps = mpApps || {};
var mpTemplates = mpTemplates || {};
mpTemplates['minnpost-mpls-council-member-questionairre'] = mpTemplates['minnpost-mpls-council-member-questionairre'] || {};
var mpData = mpData || {};
mpData['minnpost-mpls-council-member-questionairre'] = mpData['minnpost-mpls-council-member-questionairre'] || {};

/**
 * Extend underscore
 */
_.mixin({
  /**
   * Formats number
   */
  formatNumber: function(num, decimals) {
    decimals = (_.isUndefined(decimals)) ? 2 : decimals;
    var rgx = (/(\d+)(\d{3})/);
    split = num.toFixed(decimals).toString().split('.');

    while (rgx.test(split[0])) {
      split[0] = split[0].replace(rgx, '$1' + ',' + '$2');
    }
    return (decimals) ? split[0] + '.' + split[1] : split[0];
  },

  /**
   * Formats number into currency
   */
  formatCurrency: function(num) {
    return '$' + _.formatNumber(num, 2);
  },

  /**
   * Formats percentage
   */
  formatPercent: function(num) {
    return _.formatNumber(num * 100, 1) + '%';
  },

  /**
   * Formats percent change
   */
  formatPercentChange: function(num) {
    return ((num > 0) ? '+' : '') + _.formatPercent(num);
  }
});

/**
 * Nav stick plugin
 */
(function($) {
  // Plugin for sticking things.  Defaults are for sticking to top.
  var MPStickDefaults = {
    activeClass: 'stuck top',
    wrapperClass: 'minnpost-full-container',
    topPadding: 0,
    throttle: 90
  };
  function MPStick(element, options) {
    // Defined some values and process options
    this.element = element;
    this.$element = $(element);
    this._defaults = MPStickDefaults;
    this.options = $.extend( {}, this._defaults, options);
    this._name = 'mpStick';
    this._scrollEvent = 'scroll.mp.mpStick';
    this._on = false;

    this.init();
  }
  MPStick.prototype = {
    init: function() {
      // If contaier not passed, use parent
      this.$container = (this.options.container === undefined) ? this.$element.parent() : $(this.options.container);

      this.elementHeight = this.$element.outerHeight(true);

      // Create a spacer element so content doesn't jump
      this.$spacer = $('<div>').height(this.elementHeight).hide();
      this.$element.after(this.$spacer);

      // Add wrapper
      if (this.options.wrapperClass) {
        this.$element.wrapInner('<div class="' + this.options.wrapperClass + '"></div>');
      }

      // Throttle the scoll listen for better perfomance
      this._throttledListen = _.bind(_.throttle(this.listen, this.options.throttle), this);
      this._throttledListen();
      $(window).on(this._scrollEvent, this._throttledListen);
    },

    listen: function() {
      var containerTop = this.$container.offset().top;
      var containerBottom = containerTop + this.$container.height();
      var scrollTop = $(window).scrollTop();
      var top = (containerTop - this.options.topPadding);
      var bottom = (containerBottom - this.elementHeight - this.options.topPadding - 2);

      // Test whether we are in the container and whether its
      // already stuck or not
      if (!this._on && scrollTop > top && scrollTop < bottom) {
        this.on();
      }
      else if (this._on && (scrollTop < top || scrollTop > bottom)) {
        this.off();
      }
    },

    on: function() {
      this.$element.addClass(this.options.activeClass);
      if (this.options.topPadding) {
        this.$element.css('top', this.options.topPadding);
      }
      this.$spacer.show();
      this._on = true;
    },

    off: function() {
      this.$element.removeClass(this.options.activeClass);
      if (this.options.topPadding) {
        this.$element.css('top', 'inherit');
      }
      this.$spacer.hide();
      this._on = false;
    },

    remove: function() {
      this.$container.off(this._scrollEvent);
    }
  };
  // Register plugin
  $.fn.mpStick = function(options) {
    return this.each(function() {
      if (!$.data(this, 'mpStick')) {
        $.data(this, 'mpStick', new MPStick(this, options));
      }
    });
  };
})(jQuery);

/**
 * Create "class" for the main application.  This way it could be
 * used more than once.
 */
(function($, undefined) {
  // Create "class"
  App = mpApps['minnpost-mpls-council-member-questionairre'] = function(options) {
    this.options = _.extend(this.defaultOptions, options);
    this.$el = $(this.options.el);
    this.templates = mpTemplates['minnpost-mpls-council-member-questionairre'] || {};
    this.data = mpData['minnpost-mpls-council-member-questionairre'] || {};
    this.id = _.uniqueId('mp-');
  };

  _.extend(App.prototype, {
    // Use backbone's extend function
    extend: Backbone.Model.extend,

    // Default options
    defaultOptions: {
      dataPath: './data/',
      imagePath: './css/images/',
      jsonpProxy: 'http://mp-jsonproxy.herokuapp.com/proxy?callback=?&url=',
      localStorageKey: _.uniqueId('minnpost-mpls-council-member-questionairre-'),
      enableStars: false
    },

    /**
     * Template handling.  For development, we want to use
     * the template files directly, but for build, they should be
     * compiled into JS.
     *
     * See JST grunt plugin to understand how templates
     * are compiled.
     *
     * Expects callback like: function(compiledTemplate) {  }
     */
    getTemplates: function(names) {
      var thisApp = this;
      var defers = [];
      names = _.isArray(names) ? names : [names];

      // Go through each file and add to defers
      _.each(names, function(n) {
        var defer;
        var path = 'js/templates/' + n + '.mustache';

        if (_.isUndefined(thisApp.templates[n])) {
          defer = $.ajax({
            url: path,
            method: 'GET',
            async: false,
            contentType: 'text'
          });

          $.when(defer).done(function(data) {
            thisApp.templates[n] = data;
          });
          defers.push(defer);
        }
      });

      return $.when.apply($, defers);
    },
    // Wrapper around getting a template
    template: function(name) {
      return this.templates[name];
    },

    /**
     * Data source handling.  For development, we can call
     * the data directly from the JSON file, but for production
     * we want to proxy for JSONP.
     *
     * `name` should be name of file, minus .json
     *
     * Returns jQuery's defferred object.
     */
    getLocalData: function(name) {
      var thisApp = this;
      var proxyPrefix = this.options.jsonpProxy;
      var useJSONP = false;
      var defers = [];

      name = (_.isArray(name)) ? name : [ name ];

      // If the data path is not relative, then use JSONP
      if (this.options && this.options.dataPath.indexOf('http') === 0) {
        useJSONP = true;
      }

      // Go through each file and add to defers
      _.each(name, function(d) {
        var defer;
        d = d + '.json';

        if (_.isUndefined(thisApp.data[d])) {
          if (useJSONP) {
            defer = $.jsonp({
              url: proxyPrefix + encodeURI(thisApp.options.dataPath + d)
            });
          }
          else {
            defer = $.getJSON(thisApp.options.dataPath + d);
          }

          $.when(defer).done(function(data) {
            thisApp.data[d] = data;
          });
          defers.push(defer);
        }
        else {
          defer = $.Deferred();
          defer.resolveWith(thisApp, [thisApp.data[d]]);
          defers.push(defer);
        }
      });

      return $.when.apply($, defers);
    },

    /**
     * Get remote data.  Provides a wrapper around
     * getting a remote data source, to use a proxy
     * if needed, such as using a cache.
     */
    getRemoteData: function(options) {
      if (this.options.remoteProxy) {
        options.url = options.url + '&callback=proxied_jqjsp';
        options.url = app.options.remoteProxy + encodeURIComponent(options.url);
        options.callback = 'proxied_jqjsp';
        options.cache = true;
      }
      else {
        options.url = options.url + '&callback=?';
      }

      return $.jsonp(options);
    },

    // Placeholder start
    start: function() {
    }
  });
})(jQuery);

mpData = mpData || {}; mpData["minnpost-mpls-council-member-questionairre"] = mpData["minnpost-mpls-council-member-questionairre"] || {}; mpData["minnpost-mpls-council-member-questionairre"]["questions_answers.json"] = {"City Council Member Questionnaire":{"answers":[{"id":3,"candidate":"Jacob Frey","image":"JacobFrey250.jpg","summary-1":"I have not seen a rail transit plan that properly accounts for community concerns, environmental impacts and optimal private investment.","question-1":"<p>We cannot be a first-class city without substantial investments in public transportation, and specifically a Southwest line in some form. That being said, I have not seen a rail transit plan that properly accounts for community concerns, environmental impacts and optimal private investment. I would like to see final results from the studies presently being carried out before making a final decision.</p>","summary-2":"A well-executed plan for the area surrounding the new Vikings stadium is critical for the success of the new Third Ward and our city.","question-2":"<p>A well-executed plan for the area surrounding the new Vikings stadium is critical for the success of the new Third Ward and our city, perhaps even more so than the stadium itself.</p>\n<p></p>\n<p>There are five blocks adjacent to the stadium. Two of those blocks will be occupied by 30-story towers. The towers will include substantial commercial (likely Wells Fargo office space), approximately 42,000 square feet of retail, and 300 residential units. One block will be a parking garage. And the final two blocks will be converted to a park, referred to as “The Yard.”</p>\n<p></p>\n<p>Two important facets of this development will be (1) the funding mechanisms, and (2) ensuring an adequate number of eyes on the park. Both of these items can be achieved through a proactive City Council and mayor willing to promote the area as a first-class investment (and it most certainly is). By affirmatively promoting investment and development for the air rights above the parking garage, and pressing for additional residential units surrounding the park, we can make sure that there are adequate “eyes on the park” to reduce crime, while generating substantial revenue for the city.</p>","summary-3":"The main reason I am for streetcars is the “cool factor.” They make our city dynamic and exciting.","question-3":"<p>I favor the implementation of streetcars. Streetcars are a beloved part our history, but I will help them be the wave of our future. Streetcars have great advantages. They are even with the ground, thus allowing a disabled person to easily enter and exit. Additionally, they have wider aisles and deliver a smoother ride than traditional buses.</p>\n<p></p>\n<p>But the main reason I am for streetcars is the “cool factor.” They make our city dynamic and exciting. And, others cities have seen over $1 billion worth of private investment along the corridors in which they run. Such positive development could revitalize stagnant sections of our city and could bolster areas that are experiencing success.</p>\n<p></p>\n<p>In addition to the initial planned line along Nicollet to Central Avenue in Northeast, I would like to see two additional lines. One should run downtown -- down Washington Avenue. and back on Third or Fourth Street. If this line is extended to Broadway, my hope is that North Minneapolis will benefit from substantial economic investment. I would like to see an additional line running down University and back Fourth Street on the East Side.   </p>","summary-4":"I will full-heartedly support our Mayor Elect Betsy Hodges, and look forward to working with her toward results that uplift every member of our city.","question-4":"<p>The blatant opportunity gaps are perhaps the biggest issue facing our city. We must take action now! However, diverging policy plans from every single city council member will not help us move forward at the pace and level of efficacy necessary to solve the problem. We need leadership specifically from our mayor. I will full-heartedly support our Mayor Elect Betsy Hodges, and look forward to working with her toward results that uplift every member of our city.</p>","summary-5":"Our staggering education gap, homelessness … and urbanization … are front and center.","question-5":"<p>The new Third Ward is the economic engine, entertainment mecca, professional sports capital and intellectual center of our entire region. With downtown Minneapolis, sports stadiums, the arts district and parts of the University of Minnesota, pressing concerns in the Third Ward spread far beyond the ward itself. With this in mind, our staggering education gap, homelessness (which touches on housing needs and job creation) and urbanization (bringing more people back to our great city) are front and center.</p>","summary-6":"Every policy issue should be met with the following question: What will benefit our city the most?","question-6":"<p>I don’t think it’s a balance at all. One of the major problems with our present governing structure is that we have a relatively weak mayor system with council members that are not elected “at large,” but rather have their own individual “fiefdoms.” We need to move away from a segmented Minneapolis, and away from a system that grants political deference to council members on projects taking place in their respective wards. Every policy issue should be met with the following question: What will benefit our city the most? In answering that question, we take strides toward the best collective results for our city.</p>","rowNumber":1},{"id":5,"candidate":"Blong Yang","image":"BlongYang250.jpg","summary-1":"I need to see more information regarding all routing options before making an informed decision.","question-1":"<p>Of course I like the idea that light rail can connect residents in Ward 5 to jobs in the suburbs as it would connect suburban residents to jobs in the city. Other cities have experienced significant high-density development around transit that provides increased economic benefits for those cities, and I would hope that is the case here. But, I need to see more information regarding all routing options before making an informed decision. And, I need to know specifically how the routing options may impact Ward 5 residents.</p>","summary-2":"I think the City must minimize the use of subsidies in this development, given the large subsidy that the Vikings stadium will receive.","question-2":"<p>As I understand it, Wells Fargo is considering building a campus near the stadium which may provide significant job possibilities for the residents of the city, including those in Ward 5. I would like to dig deeper to determine exactly what kinds of opportunities may come of that. I’m also wondering, however, if there might be a chance to match city residents as apprentices with master tradesmen — plumbers, electricians and carpenters, for example — working on the stadium and other development so that some people who need living-wage work might build skills in those trades. I think the city might be able to facilitate those connections in pursuit of widening the job opportunities that come out of this project.</p>\n<p></p>\n<p>Additionally, I think the City must minimize the use of subsidies in this development, given the large subsidy that the Vikings stadium will receive. If we continue to subsidize the downtown areas, such as the area near the new Vikings stadium, at the expense of other areas like the Northside, we will continue to see the huge disparities that are currently problematic in our city.</p>\n<p></p>\n<p>The city must foster development in the neediest areas first. It is incumbent on the city to focus its attention on the Northside, an area that has been neglected for far too long.</p>","summary-3":"I believe that as a city, we must focus on basic services first. I see streetcars as a luxury.","question-3":"<p>I am doing more study on the question of how streetcars fit into our transportation needs now and in the future. I’m concerned that West Broadway is too narrow to accommodate streetcars, and I’d like to see the environmental and pre-development activity studies as well as other analyses on how streetcars compare to enhanced bus service before I come to a final conclusion.</p>\n<p></p>\n<p>I believe that as a city, we must focus on basic services first. I see streetcars as a luxury. If the Northside has the opportunity to choose between streetcars or the money that will be spent on them ($50 million per mile), I believe that the money (used however we see fit) would do more for economic development than streetcars.</p>\n","summary-4":"There’s a definite opportunity here to have a significant impact on the health care gap.","question-4":"<p>In the area of health care, I think the people in Ward 5 will benefit tremendously from the insurance benefits that are offered through MNSure, our state health care exchange. There’s a definite opportunity here to have a significant impact on the health care gap. In spite of the October launch, there is still a great deal of misinformation in circulation regarding the Affordable Care Act and what it offers, including confusion about health tax credits, subsidies and just generally the health benefits that are available.</p>\n<p></p>\n<p>Not everyone has a home computer, and there is a digital divide, so it’s my intent to ensure that trusted grass-roots organizations on the ground in Ward 5 and across the city are getting the word out to everyone that health insurance is available and can be affordable no matter your budget or circumstances. Information can go a long way toward closing the health care gap that has the greatest impact on people who are most vulnerable, particularly low-income households.</p>","summary-5":"For people in my ward, the greatest concerns are safety from violence, especially gun violence, and access to living-wage jobs.","question-5":"<p>For people in my ward, the greatest concerns are safety from violence, especially gun violence, and access to living-wage jobs. I think a basic common-sense approach to the question of safety is to ensure that there are enough police officers to adequately patrol Minneapolis. Right now, the police department says they’re short about 100 officers. We need to allocate the funds to hire those officers. In addition, I think we should institute a robust community-policing model with officers out walking the streets and biking in our neighborhoods so that the police come to know neighbors in our community and community members get to know them. Frankly, that could go a long way toward mitigating the distrust that some Northsiders feel toward the police and reducing the fear that police have of our community.</p>\n<p></p>\n<p>In terms of living-wage jobs, it’s my intent to work tirelessly to attract new businesses to North Minneapolis, including small and minority-owned businesses. The city can help there by cutting red tape around business development and fostering a more business-friendly environment.</p>","summary-6":"My constituents are my focus and concern, but I recognize that as a city councilman, I am a policy-maker for all of Minneapolis.","question-6":"<p>I’ll listen to all sides of any argument &mdash; including input from my constituents — and make decisions based on what benefits the residents of Ward 5. At times when there is a conflict, I’ll try to compromise in ways that don’t unduly disadvantage the people who voted me into office. My constituents are my focus and concern, but I recognize that as a city councilman, I am a policy-maker for all of Minneapolis.</p>","rowNumber":2},{"id":6,"candidate":"Abdi Warsame","image":"AbdiWarsame250.jpg","summary-1":"I acknowledge outstanding concerns in regards to any plan that runs both freight trains and light rail … through the Kenilworth Corridor at ground level.","question-1":"<p>Expanding the transit system in the metro area is a wise and prudent investment. However, I also acknowledge outstanding concerns in regards to any plan that runs both freight trains and light rail into Minneapolis through the Kenilworth Corridor at ground level. I believe that all concerns and impacts should be identified fairly and addressed fully.</p>","summary-2":"My priorities … include promoting a strong commercial core and growing our downtown as a hub for arts, culture and entertainment.","question-2":"<p>My priorities for the development of that area are centered on continued growth. Those priorities include promoting a strong commercial core and growing our downtown as a hub for arts, culture and entertainment. I think there’s room for the city to guide, foster and encourage development. The city has an opportunity to assess needs and resources.</p>","summary-3":"I view streetcars with permanent construction as a strong catalyst for development.","question-3":"<p>I view streetcars with permanent construction as a strong catalyst for development. The Central-Nicollet route houses 90,000 residents within half a mile and provides access to 125,000 jobs. This development will help sustain growth in both population and in services that cater to our population.</p>","summary-4":"I plan to partner with labor unions and technical schools so that residents … have access to registered apprenticeships and technical training that our local markets demand.","question-4":"<p>The achievement and opportunity gaps are issues that transcend ideology &mdash; they are issues that must be solved. In me you have a collaborator and a convener, not an ideologue. As a council member, I will bring people together to take incremental steps on our seemingly most intractable problems. Creating jobs is a primary focus for my office. I plan to partner with labor unions and technical schools so that residents of my Ward have access to registered apprenticeships and technical training that our local markets demand.</p>","summary-5":" I cannot focus on just one issue but will be dedicated to serving the needs of every community.","question-5":"<p>There are many urgent issues facing my ward. As a council member, I cannot focus on just one issue but will be dedicated to serving the needs of every community. That means working proactively with colleagues and staff to close opportunity gaps, working with businesses and labor unions to create high-quality living wage jobs, working with neighborhood organizations to make our ward greener, and working with security agencies to make our streets and neighborhoods safer.</p>","summary-6":"My ward interests often parallel with city-wide priorities of growth, equity and economic development.","question-6":"<p>My ward interests often parallel with city-wide priorities of growth, equity and economic development. I’m optimistic that our shared values and priorities with both the mayor and council members will help balance the needs of each ward and the needs of our city at large.</p>","rowNumber":3},{"id":12,"candidate":"Andrew Johnson","image":"AndrewJohnson250.jpg","summary-1":"SWLRT offers so many benefits to Minneapolis, and I am committed to seeing it built.","question-1":"<p>This is a massive project, one which I have immersed myself in the details of, weighing everything from route selection to the politics regarding freight and funding.</p>\n<p></p>\n<p>SWLRT offers so many benefits to Minneapolis, and I am committed to seeing it built. While I am still carefully considering all options, the shallow tunnel appears to be the most viable one, provided the hydrogeological study comes back without concerns.</p>","summary-2":"The Ryan project is exciting, and I would love to see a mini “central park” downtown.","question-2":"<p>The Ryan project is exciting, and I would love to see a mini “central park” downtown. I am not a fan of public subsidies for private projects, but I will happily consider responsible investments in public infrastructure, which in turn help stimulate private development.</p>","summary-3":"I lean towards streetcars over enhanced bus service, but the big question is how we would fund them.","question-3":"<p>I lean towards streetcars over enhanced bus service, but the big question is how we would fund them… that could be a deal-breaker.</p>\n<p></p>\n<p>In terms of value, streetcars offer a lower cost per rider than LRT while having a similar ability to attract new ridership and stimulate private development.</p>","summary-4":"We can’t simply do one thing here and one thing there. We need to be strategic and address many things together in a systemic way.","question-4":"<p>The achievement gap is a symptom. Its root causes are based on issues of food security, social justice, community safety and the economic opportunities available to families. These are issues the City Council can and should tackle, which in turn affect the outcomes within the classroom.</p>\n<p></p>\n<p>I know you want specifics, and where I struggle within this questionnaire is from turning it into an essay. The issues of the achievement gap and disparities in general are complex and interrelated. We can’t simply do one thing here and one thing there. We need to be strategic and address many things together in a systemic way.</p>\n<p></p>\n<p> For instance, addressing the issues of economic opportunities available to families requires changes to our business ordinances and processes to cut red tape, additional grants and support for entrepreneurs of color, transit improvements, training, making advances in living wages, rebranding communities, proactively recruiting businesses, etc. It involves collaborating with residents and neighborhood associations, business leaders, multiple levels of government, and of course all of my colleagues and our new mayor. It is not easy, it will take time, yet this is one of the ways we can really make a difference that will help families and in turn help children enter the classroom ready to learn.</p>\n<p></p>\n<p>I also have a personal goal to see every young person get their hands in the soil, learn where their food comes from and learn how to prepare it. If we do this, I believe we will instill healthy eating habits in an entire generation.</p>","summary-5":"It really varies across the ward. Education was the No. 1 issue I heard about.","question-5":"<p>It really varies across the ward. Education was the No. 1 issue I heard about. I talked with many young families weighing whether they stay in Minneapolis and plant their roots deep, or leave for the suburbs. Keeping them here is clearly an opportunity we don’t want to miss. </p>\n<p></p>\n<p>I have an education plan on my <a href=\"http://www.andrewmpls.com/issues\" target=\"_blank\">website</a> that addresses what I will do.</p>\n<p></p>\n<p>Concerns over airport noise are synonymous with parts of Ward 12, and the <a href=\"http://www.faa.gov/air_traffic/publications/atpubs/aim/aim0102.html\" target=\"_blank\">potential implementation of RNAV</a> would have an unacceptable impact on the quality of life for some residents in the ward. Because the city council doesn’t get a vote when it comes to FAA decisions, our best and perhaps only option is to build public pressure.</p>","summary-6":"Whichever side of a difficult vote I land on, I will sleep best at night knowing that I was open-minded, listened, fully informed, and did what I thought was best.","question-6":"<p>There is also commitment to my diligence and values. Whichever side of a difficult vote I land on, I will sleep best at night knowing that I was open-minded, listened, fully informed, and did what I thought was best, given the information I had. Fortunately, what’s good for the city is usually good for Ward 12.</p>","rowNumber":4},{"id":10,"candidate":"Lisa Bender","image":"LisaBender250.jpg","summary-1":"We should find a way to build this important transit connection that does not negatively impact our lakes and trail system.","question-1":"<p>We should find a way to build this important transit connection that does not negatively impact our lakes and trail system, which are used by thousands of people every day. Today, 50 percent of commuters take transit to downtown Minneapolis. Expanding our transit system will give this option to more people, leading to less wear-and-tear on our heavily subsidized road system, less air pollution and transportation cost savings for many families. </p>\n<p></p>\n<p>I am committed to advocating for the City of Minneapolis and ensuring that we get the best transit service possible for our communities and that our lakes and trail system are not harmed. I look forward to carefully reviewing the details of the upcoming environmental and freight relocation studies.</p>","summary-2":"I support the continued development of a vibrant downtown Minneapolis with a mix of housing, office and retail.","question-2":"<p>I support the continued development of a vibrant downtown Minneapolis with a mix of housing, office and retail. The city has a key role to use early strategic funding to attract high-quality private investment that advances our city community development goals. Rather than subsidize private development or parking, I would prefer to invest any public funds in public infrastructure, including streets and successful public spaces that attract private development.</p>\n<p></p>\n<p>Any public spaces developed as part of the Vikings stadium or other developments should be carefully planned and managed to ensure they don’t turn into empty, unused spaces like many other downtown parks. </p>","summary-3":"I support streetcars on the Central/Nicollet transit corridor. Both streetcars and enhanced bus service have great benefits.","question-3":"<p>I support streetcars on the Central/Nicollet transit corridor.  Both streetcars and enhanced bus service have great benefits – both improve transit service, can attract new riders and spur development. However, in comparable cities, the kind of enhanced bus that we are proposing in Minneapolis – buses running in mixed traffic – do not have the type of benefits seen with streetcars. (Cities have had great success with fully separated, high-quality Bus Rapid Transit achieving similar impacts as streetcar, but that is not what we are proposing.)</p>\n<p></p>\n<p>The Nicollet/Central corridor is a good location for our first streetcar line because there is enough existing transit ridership but the potential for much more, and streetcars are good at attracting new transit riders. There is a lot of development potential along the corridor, making it likely that the city will recuperate its capital investment, and allowing us to leverage a relatively small amount of local funds for regional and (as long as the Metropolitan Council is supportive) federal transit investment dollars. A streetcar should help realize the redevelopment of the K-Mart store site, reopening Lake at Nicollet, which is a high priority for our community and for my first term.</p>\n<p></p>\n<p>As we develop our streetcar/enhanced bus system, I will work to ensure two things: 1) that transportation investments are tied to good land use planning, and 2) that capital investments are made strategically and equitably in the city.</p>","summary-4":"I am particularly committed to ensuring our children have the opportunity to be healthy and develop good lifelong habits.","question-4":"<p>I am committed to working with my colleagues and Minneapolis communities to close all of these gaps. Our gap in health is one of the highest in the nation and is, in part, the result of disinvestment in some Minneapolis neighborhoods and inequitable access to physical activity and healthy foods. </p>\n<p></p>\n<p>I am particularly committed to ensuring our children have the opportunity to be healthy and develop good lifelong habits. I support a number of strategies to achieve this: 1) provide safe walking and bicycling infrastructure in all Minneapolis neighborhoods to support daily activity, 2) specifically support our Safe Routes to School program, which has a number of benefits for our kids, 3) promote urban farming and community gardening as one way to teach kids about healthy food choices, and 4) support efforts to provide healthy foods in our public schools.</p>\n","summary-5":"For both [renters and homeowners], increasing housing options and growing the city’s population and tax base will be beneficial.","question-5":"<p>The residents of Ward 10 are most concerned with the impacts of growth and change on our neighborhoods. The cost of housing is a concern for renters, who make up 70 percent of the ward’s population, and homeowners alike. For both, increasing housing options and growing the city’s population and tax base will be beneficial, but there is concern about the impacts of development.</p>\n<p></p>\n<p>To address this, I will 1) work to support good urban design and great public spaces in our city and neighborhoods, 2) advocate for investment in transportation options, including safe bicycling and walking and efficient transit, to minimize congestion, 3) support real preservation strategies that work to preserve the character of our neighborhoods, and 4) work to implement the city’s Climate Action Plan so that our population growth means less, not more, regional impact on the environment.</p>","summary-6":"I will work toward making system-wide reforms that benefit the neighborhoods of Ward 10 and the city as a whole.","question-6":"<p>At the end of the day, each neighborhood has to succeed for our whole city to succeed. I will work toward making system-wide reforms that benefit the neighborhoods of Ward 10 and the city as a whole. I am committed to protecting our beautiful lakes and river, supporting cultural institutions and our local arts community, to providing transportation options, supporting our small-business community and growing the city while preserving the historic character of our neighborhoods.</p>\n<p></p>\n<p>As policy-makers, we have to do our best to balance many competing needs. In this time of scarce resources, we must be strategic and have a high bar for investment of public dollars. It is my commitment to prioritize closing our city’s equity gaps and to involving and honoring the needs of residents from all walks of life and every stage of life. Minneapolis can and should protect our high quality of life and make our city an even better place to live in the future.</p>","rowNumber":5},{"id":13,"candidate":"Linea Palmisano","image":"LineaPalmisano250.jpg","summary-1":"We need a city where people are not dependent on car ownership to hold a job, to live well and to transit safely, and we are not there yet.","question-1":"<p>We need a city where people are not dependent on car ownership to hold a job, to live well and to transit safely, and we are not there yet. A connected city increases our diversity and sustainability in many ways. It is one of the most important equity measures we can provide.</p>\n<p></p>\n<p>Like many residents who enjoy our lakes for recreation and natural beauty, I have concerns about the potentially deleterious effect of building shallow tunnels to co-locate light rail alongside freight rail. I have also generally opposed co-location.  I would only support this plan if all other alternatives were exhausted and a thorough environmental analysis was conducted with results to my satisfaction.</p>\n<p></p>\n<p>In the recent study that came out last week, we received very good news and I am eager to see a re-route plan that in my initial review appears to be better than we ever imagined for the entire region involved.</p>","summary-2":"The city should use this opportunity to showcase what makes Minneapolis unique: its vibrant public spaces, its walkability and its cultural diversity.","question-2":"<p>Although I do not agree with the outcome of the City Council vote in May of 2012, the deal is now well under way, and we need to focus on how to maximize its benefit to taxpayers and those who live near the new stadium. The city should use this opportunity to showcase what makes Minneapolis unique: its vibrant public spaces, its walkability and its cultural diversity. I’d like to work with our Community Planning & Economic Development staff to implement strategies for bringing independently owned businesses to the stadium, particularly those that represent our biggest minority groups.</p>\n<p></p>\n<p>We should prioritize “Complete Streets” that allow for safe transportation for all modes: pedestrians — including those requiring ADA accessibility, cyclists, transit riders and private vehicles, and we should take advantage of the stadium’s proximity to the Mississippi by building connections to existing riverfront development.  For example, a cycle center for secure bike parking and rentals near the stadium would be a great amenity for visitors and residents alike, and we could look to the private sector for potential partners. We can allow for small-area planning while not being too “prescriptive,” meaning, we can ensure the zoning on restaurant establishments and work toward an activity center year-round and with interest of residents and workers as well as visitors.</p>","summary-3":"Although enhanced bus service costs less to build, streetcars … are more likely to support economic development in the corridor.","question-3":"<p>Over 3,000 people participated in the public outreach that took place as part of the Alternatives Analysis for transit in the Nicollet-Central Corridor. This public sentiment, supported by rigorous technical analysis, formed the basis of streetcars being selected as the Locally Preferred Alternative. Although enhanced bus service costs less to build, streetcars have similar operating and maintenance costs on a per-passenger basis and are more likely to support economic development in the corridor. Given the lifespan of transit investments, I believe it is wise to take a long-range view. I stand behind the will of the people and the technical experts in their decision.</p>","summary-4":"Without safe and secure housing, significant improvements cannot be made in health care, education or employment.","question-4":"<p>Minneapolis faces daunting problems of inequity in all of these areas. It is my belief that without safe and secure housing, significant improvements cannot be made in health care, education or employment. I will be examining the barriers to the development of affordable housing in the city, and looking at ways to incentivize developers to create more units of affordable housing in every ward. Location Efficient Mortgages are another way to increase borrowing power for people who choose to live in transit-rich areas, and I plan to look into the viability of bringing that financing program to Minneapolis.</p>\n<p></p>\n<p>Specifically working to coordinate services for children that live without a permanent address is a special concern of mine, and I am looking for ways to reduce the workload placed upon teachers in coordinating services between the county and the city, and see if there is a better way to deliver intervention.</p>","summary-5":"Taxes, the environment, safety and education are all of largest concern in my community.","question-5":"<p>Taxes, the environment, safety and education are all of largest concern in my community.  Infill housing (teardowns of existing homes to erect larger new homes) is one of the most pressing concerns in our ward. With the economy rebounding, it’s hard to find a single block that hasn’t been impacted by construction. Although we’re thrilled to be such a desired community, we need to find a way to improve the construction process and outcomes. I will be reviewing the existing Infill Housing Ordinance to see if there are opportunities to strengthen it, comparing Minneapolis building code to other municipalities, to see if improvements can be made (particularly to allowable materials), and researching what can be done through legislation to improve quality of life issues for neighbors — noise, dirt, damage to our natural environment, and even where Port-A-Potties can be placed. Teardowns affect our ability to encourage a friendly and diverse community, and I am working on partnerships with neighborhood groups, the U of M and the planning department to assist in policy modification.</p>","summary-6":"Change starts at the local level, but productive change cannot happen at the expense of our larger community.","question-6":"<p>Change starts at the local level, but productive change cannot happen at the expense of our larger community. If I suspect conflicts might occur, I will use my personal associations across the city to gain perspective and insight. We are fortunate to live in a city with such a breadth of resources, and I will use all of the tools at my disposal (universities, policy-makers, small-business owners, community leaders) to inform my decisions. I have plenty to learn in the next four years, and I’m looking forward to the challenges ahead.</p>","rowNumber":6}],"questions":[{"id":1,"shortname":"Southwest LRT","question":"One of your first decisions may be whether to approve or disapprove of the proposed Southwest Light Rail Transit plan. The current City Council has opposed any plan that runs both freight trains and light rail into Minneapolis through the Kenilworth Corridor at ground level. Where do you stand, and why? (<a href=\"http://www.minnpost.com/cityscape/2013/10/southwest-lrt-proposal-rumbles-near-death-experience-territory\">Learn more</a>)","rowNumber":1},{"id":2,"shortname":"Downtown development","question":"The City Council and mayor will be making major decisions about development plans near the new Vikings stadium. What are your priorities for development there, and what should the city’s role be in fostering development?  (<a href=\"http://www.minnpost.com/cityscape/2013/08/sorting-out-ins-and-outs-downtown-east\">Learn more</a>)","rowNumber":2},{"id":3,"shortname":"Streetcars vs. bus","question":"Do you favor streetcars or enhanced bus service for the proposed Central/Nicollet transit line? Why?  (<a href=\"http://www.minnpost.com/politics-policy/2013/09/streetcars-endorsed-minneapolis-central-nicollet-transit-line\">Learn more</a>)","rowNumber":3},{"id":4,"shortname":"Opportunity gaps","question":"The 2013 city elections focused a lot on opportunity gaps in housing, health care, education and employment. Choose one of those gaps and explain in specifics how you would address the problem.  (<a href=\"http://www.minnpost.com/learning-curve/2013/08/why-minneapolis-mayoral-candidates-are-making-strong-schools-such-big-issue\">Learn more</a>)","rowNumber":4},{"id":5,"shortname":"Neighborhood concerns","question":"What is the most pressing issue that concerns residents of your ward?  What will you do to address those concerns?  (<a href=\"http://www.minnpost.com/cityscape/2013/09/seven-mayoral-candidates-agree-big-goals-minneapolis-not-how-achieve-them\">Learn more</a>) ","rowNumber":5},{"id":6,"shortname":"Conflicting priorities","question":"As a council member, you will be both an advocate for residents of your ward and a policy-maker for the whole city. How will you balance those sometimes-conflicting commitments?  (<a href=\"http://www.minnpost.com/two-cities/2013/01/minneapolis-mayor-rt-rybak-outlines-ambitious-final-do-list\">Learn more</a>)  ","rowNumber":6}]}}; 



mpTemplates = mpTemplates || {}; mpTemplates['minnpost-mpls-council-member-questionairre'] = {"template-application":"<div class=\"grid-container grid-parent {{ (canStore) ? 'can-store' : '' }}\">\n  <div class=\"grid-100 message-container\"></div>\n\n  <div class=\"grid-100 grid-parent content-container cf\"></div>\n\n  <div class=\"grid-100 grid-parent footnote-container\"></div>\n</div>","template-candidates":"<div class=\"question-menu grid-20 mobile-grid-100 tablet-grid-30\">\n  <div class=\"question-menu-inner\">\n    <h5>Issues</h5>\n\n    <ul>\n      {{#questions:q}}\n        <li><span class=\"link\" on-tap=\"slideTo:{{ id }}\">{{ shortname }}</span></li>\n      {{/questions}}\n    </ul>\n\n    {{#(options.enableStars !== false)}}\n      <h5>Starred</h5>\n\n      <ul>\n        {{#candidates:c}}\n          <li class=\"{{ (maxStarred !== 0 && maxStarred === starred) ? 'favored-candidate' : '' }}\"><span class=\"starred-candidate\">{{ starred }}</span> &mdash; {{ candidate }}</li>\n        {{/candidates}}\n      </ul>\n    {{/()}}\n  </div>\n</div>\n\n<div class=\"candidates-questions-answers grid-80 mobile-grid-100 tablet-grid-70\">\n  {{#questions:q}}\n    <div class=\"question grid-100 grid-parent\" id=\"question-{{ id }}\">\n      <p class=\"question-text\"><span class=\"question-title\">{{ shortname }}:</span> {{{ question }}}</p>\n\n      {{#answers:a}}\n        <div class=\"answer grid-50\" id=\"answer-{{ q }}-{{ a }}\">\n          <div class=\"answer-inner\">\n            <div class=\"answer-image\"><img src=\"{{ options.imagePath }}{{ image }}\" /></div>\n\n            {{#(options.enableStars !== false)}}\n              <div class=\"star {{ (starred) ? 'starred' : '' }}\" on-tap=\"star:{{ q }},{{ a }}\">★</div>\n            {{/()}}\n\n            <h5>{{ candidate }}</h5>\n\n            <div class=\"summary-answer\">\n              <p class=\"summary-text\"><strong>Summary</strong>: {{ summary }}</p>\n\n              {{#answer}}\n                <div class=\"answer-text\">{{{ answer }}}</div>\n\n                <div class=\"link read-more\" on-tap=\"readMore:{{ q }},{{ a }}\">Read more</div>\n              {{/answer}}\n            </div>\n          </div>\n        </div>\n      {{/answers}}\n    </div>\n  {{/questions}}\n</div>","template-footnote":"<div class=\"footnote\">\n  <p>Candidate answers were received via a questionnaire that MinnPost sent to candidates.  {{#(options.enableStars !== false)}}<span class=\"remove-local-storage\">Your starred answers are stored locally on your computer; for your privacy you can <span class=\"link remove-storage\" on-tap=\"removeStorage\" href=\"#remove\">clear your starred questions</span>.</span>{{/()}}  Some code, techniques, and data on <a href=\"https://github.com/MinnPost/minnpost-mpls-mayoral-questionnaire\" target=\"_blank\">Github</a>.</p>\n</div>","template-loading":"<div class=\"loading-container\">\n  <div class=\"loading\"><span>Loading...</span></div>\n</div>"};

/**
 * Main app logic for: minnpost-mpls-council-member-questionairre
 */
(function(App, $, undefined) {
  _.extend(App.prototype, {
    // Start function that starts the application.
    start: function() {
      var thisApp = this;
      var templates = ['template-application', 'template-footnote', 'template-candidates', 'template-loading'];

      // Check if we can use local storage
      this.checkCanStore();

      // Get templates
      this.getTemplates(templates).done(function() {
        // Render the container and "static" templates.
        thisApp.applicationView = new App.prototype.ApplicationView({
          el: thisApp.$el,
          template: thisApp.template('template-application'),
          data: {
            canStore: thisApp.canStore
          }
        });
        thisApp.footnoteView = new App.prototype.FootnoteView({
          el: thisApp.$el.find('.footnote-container'),
          data: {
            options: thisApp.options
          },
          template: thisApp.template('template-footnote')
        });
        thisApp.footnoteView.app = thisApp;

        // Get data.  Can't seem to find a way to use mustache and nested
        // loops to be able to reference question ids, so that means
        // we repeat data into a question collection
        thisApp.getLocalData(['questions_answers']).done(function(data) {
          var questionsAnswers = [];
          answers = data['City Council Member Questionnaire'].answers;
          questions = data['City Council Member Questionnaire'].questions;

          // Get local data
          thisApp.questions = thisApp.fetch();

          // We actually want to see if things have changed so that
          // the localstorage can be replaced.  In another version, the starred
          // should have been saved separately
          _.each(questions, function(q, qi) {
            var qID = 'question-' + q.id;
            var sID = 'summary-' + q.id;
            q.answers = [];

            _.each(answers, function(a, ai) {
              var answer = {};
              answer.answer = a[qID];
              answer.summary = a[sID];

              _.each(a, function(c, ci) {
                if (ci.indexOf('question') !== 0 && ci.indexOf('summary') !== 0) {
                  answer[ci] = c;
                }
              });

              q.answers.push(answer);
            });

            questionsAnswers.push(q);
          });

          if (_.isUndefined(thisApp.questions)) {
            // Create collections container and store locally
            thisApp.questions = new App.prototype.QuestionsCollection(questionsAnswers);
            thisApp.save();
          }
          else {
            // Check if things have changed
            thisApp.invalidateLocalStorage(questionsAnswers);
          }

          // Aggregate the data
          thisApp.aggregateCandidates();

          // Create view
          thisApp.candidatesView = new App.prototype.CandidatesView({
            el: thisApp.$el.find('.content-container'),
            template: thisApp.template('template-candidates'),
            data: {
              candidates: thisApp.candidates,
              questions: thisApp.questions,
              maxStarred: thisApp.maxStarred || 0,
              options: thisApp.options
            },
            adaptors: ['Backbone'],
            app: thisApp
          });
          thisApp.candidatesView.app = thisApp;
        });
      });
    },

    // Function to turn questions data into candidates model
    aggregateCandidates: function() {
      var thisApp = this;
      var max;

      // Create collection if needed
      if (!_.isObject(this.candidates)) {
        this.candidates = new App.prototype.CandidatesCollection();
      }

      // Go through the questions and answers and get
      // any candidates to add to collection
      this.questions.each(function(q, qi) {
        _.each(q.get('answers'), function(a, ai) {
          var c = thisApp.candidates.get(a.id);

          if (_.isUndefined(c)) {
            c = new App.prototype.CandidateModel(a);
            thisApp.candidates.add(c);
          }
        });
      });

      // Go through each candidate, then count the stars of each question
      this.candidates.each(function(c, ci) {
        var starred = 0;

        thisApp.questions.each(function(q, qi) {
          _.each(q.get('answers'), function(a, ai) {
            if (a.starred && a.id === c.id) {
              starred++;
            }
          });
        });

        c.set('starred', starred);
      });

      // Figure out what is favored candidate
      max = this.candidates.max(function(c, i) {
        return c.get('starred');
      });
      this.maxStarred = max.get('starred');
      if (_.isObject(this.candidatesView)) {
        thisApp.candidatesView.set('maxStarred', this.maxStarred);
      }
    },

    // Check if localstorage is available
    checkCanStore: function() {
      var mod = 'modernizr';

      if (this.options.enableStars === false) {
        return false;
      }

      try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        this.canStore = true;
        return true;
      }
      catch(e) {
        this.canStore = false;
        return false;
      }
    },

    // Save questions to local store
    save: function() {
      if (this.canStore) {
        localStorage.setItem(this.options.localStorageKey, JSON.stringify(this.questions));
      }
    },

    // Get questions to local store
    fetch: function() {
      var stored;

      if (this.canStore) {
        stored = localStorage.getItem(this.options.localStorageKey);
        if (stored) {
          return new App.prototype.QuestionsCollection(JSON.parse(stored));
        }
        else {
          return undefined;
        }
      }
      else {
        return undefined;
      }
    },

    // Destroy
    destroy: function() {
      if (this.canStore) {
        return localStorage.removeItem(this.options.localStorageKey);
      }
    },

    // Look to see if we need to update the local storage
    invalidateLocalStorage: function(recentData) {
      var invalidate = false;
      var current = JSON.parse(JSON.stringify(this.questions));

      if (_.size(current) != _.size(recentData) ||
        !_.isEqual(_.pluck(current, 'question'), _.pluck(recentData, 'question'))) {
        invalidate = true;
      }

      _.each(recentData, function(r, ri) {
        _.each(r.answers, function(a, ai) {
          if (a.answer !== current[ri].answers[ai].answer ||
            a.summary !== current[ri].answers[ai].summary) {
            invalidate = true;
          }
        });
      });

      if (invalidate) {
        this.questions = new App.prototype.QuestionsCollection(recentData);
        this.save();
      }
    }
  });

  // Models
  App.prototype.CandidateModel = Backbone.Model.extend({
  });
  App.prototype.QuestionModel = Backbone.Model.extend({
  });

  // Collections
  App.prototype.CandidatesCollection = Backbone.Collection.extend({
    model: App.prototype.CandidateModel
  });
  App.prototype.QuestionsCollection = Backbone.Collection.extend({
    model: App.prototype.QuestionModel
  });

  // Views
  App.prototype.ApplicationView = Ractive.extend({
  });
  App.prototype.FootnoteView = Ractive.extend({
    init: function() {
      this.on('removeStorage', function(e) {
        e.original.preventDefault();
        this.app.destroy();
      });
    }
  });
  App.prototype.CandidatesView = Ractive.extend({
    init: function(options) {
      var thisView = this;
      this.app = options.app;

      // Stick menu
      $(this.el).find('.question-menu-inner').mpStick({
        activeClass: 'stuck container',
        wrapperClass: '',
        container: $(this.el).find('.question-menu-inner').parent().parent(),
        topPadding: 20,
        throttle: 100
      });

      // Handle starrring
      if (this.app.options.enableStars !== false) {
        this.on('star', function(e) {
          e.original.preventDefault();
          var current = this.get(e.keypath + '.starred');
          this.set(e.keypath + '.starred', (current) ? false : true);
          this.app.aggregateCandidates();
          this.app.save();
        });
      }

      // Read more
      this.on('readMore', function(e, parts) {
        e.original.preventDefault();
        var q = parts.split(',')[0];
        var a = parts.split(',')[1];
        var $answer = $(this.el).find('#answer-' + q + '-' + a);
        var more = $answer.data('more') || false;

        if (!more) {
          $answer.find('.read-more').html('Read less');
          $answer.find('.summary-text').fadeOut(function() {
            $answer.find('.answer-text').slideDown();
          });
          $answer.data('more', true);
        }
        else {
          $answer.find('.read-more').html('Read more');
          $answer.find('.answer-text').slideUp(function() {
            $answer.find('.summary-text').fadeIn();
          });
          $answer.data('more', false);

          $('html, body').animate({ scrollTop: $answer.offset().top - 5}, 750);
        }
      });

      // Slide
      this.on('slideTo', function(e, id) {
        e.original.preventDefault();
        var top = $(this.el).find('#question-' + id).offset().top;
        $('html, body').animate({ scrollTop: top - 15}, 750);
      });
    }
  });
})(mpApps['minnpost-mpls-council-member-questionairre'], jQuery);