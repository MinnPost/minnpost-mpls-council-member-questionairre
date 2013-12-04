/**
 * Some core functionality for minnpost applications
 */

/**
 * Global variable to hold the "application", templates, and data.
 */
var mpApps = mpApps || {};
var mpTemplates = mpTemplates || {};
mpTemplates['minnpost-mpls-mayoral-questionnaire'] = mpTemplates['minnpost-mpls-mayoral-questionnaire'] || {};
var mpData = mpData || {};
mpData['minnpost-mpls-mayoral-questionnaire'] = mpData['minnpost-mpls-mayoral-questionnaire'] || {};

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
 * Create "class" for the main application.  This way it could be
 * used more than once.
 */
(function($, undefined) {
  // Create "class"
  App = mpApps['minnpost-mpls-mayoral-questionnaire'] = function(options) {
    this.options = _.extend(this.defaultOptions, options);
    this.$el = $(this.options.el);
    this.templates = mpTemplates['minnpost-mpls-mayoral-questionnaire'] || {};
    this.data = mpData['minnpost-mpls-mayoral-questionnaire'] || {};
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
      localStorageKey: _.uniqueId('minnpost-mpls-mayoral-questionnaire-')
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

mpData = mpData || {}; mpData["minnpost-mpls-council-member-questionairre"] = mpData["minnpost-mpls-council-member-questionairre"] || {}; mpData["minnpost-mpls-council-member-questionairre"]["questions_answers.json"] = {"City Council Member Questionnaire":{"answers":[{"id":1,"candidate":"Mark Andrew","image":"MarkAndrew250.png","summary-1":"My top priority will be to care for our city’s children by ensuring that they are educated and trained for tomorrow’s jobs. ","question-1":"<p>The next mayor of Minneapolis has a moral obligation to be an education mayor. My top priority as mayor will be to care for every one of our city’s children by ensuring that they are educated and trained for tomorrow’s jobs. I want to make Minneapolis schools the first choice for Minneapolis families. <a href=\"http://www.markforminneapolis.com/growinggreatkids\" target=\"_blank\">Read more here</a>.\n</p><p>\nI plan to do this in three ways:\n</p><p>\n1. On day one of my administration, I will convene a Mayor’s Council on Education made up of leaders from various backgrounds to begin immediately bringing everyone together on behalf of our children’s future. As a sign of what’s to come, Mike Ciresi (education advocate and attorney) and Louise Sundin (education advocate and executive vice president of the Regional Labor Federation) have already agreed to co-convene the council. I will work with the Minneapolis Public Schools superintendent, the school board and the community to better prepare students with the skills and knowledge they need to compete for tomorrow’s jobs. \n</p><p>\n\n2. As mayor, I will build safe neighborhoods, stable housing and economic opportunities for all Minneapolis families. Every neighborhood in Minneapolis needs to be a neighborhood of choice: safe, with stable affordable housing, connected to jobs, transit and recreational amenities. \n\n</p><p>\n3. My administration will renew and expand the Youth Coordinating Board (YCB) into a broader partnership focused solely on ensuring success for every Minneapolis child. The YCB is the multi-jurisdictional table where the city, the county, Minneapolis Public Schools and the Minneapolis Park and Recreation Board come together to coordinate services for Minneapolis’ children (a board that I helped found in 1985). \n</p>\n","summary-2":"Raising property taxes is not an option. Failing to restore quality to basic services is also not an option.","question-2":"<p>Raising property taxes is not an option. Failing to restore quality to basic services is also not an option. The current mayor is leaving the city on good financial footing, and as the next mayor, I will further his work of fiscal responsibility, while also continuing to provide solid services and invest in projects that reflect our values and build Minneapolis. I will do this in three ways:\n</p><p>\nFirst, I will continue working with the state to bring resources to Minneapolis, including LGA (local government aid).\n</p><p>\nSecond, I will promote tax base growth, which brings in more tax-paying properties and lowers everyone’s property taxes. We will increase our population by 100,000 people to spread out the cost of services. When we create transit, invest in green spaces and the arts and provide opportunities for economic development, people move here.\n</p><p>\nThird, innovation is a powerful way that will help us grow our way out of our current financial challenges. I have a proven record as an innovator in collaboration and service redesign. Intergovernmental collaboration will save money, eliminate duplication and improve quality. I will work with the county, school board, park board and the state to develop, design and implement efficiencies.\n</p>","summary-3":"I would have fought for a referendum and a better funding package. We need to make the best of a bad situation.","question-3":"<p>I would have fought for a referendum and a better funding package, but the Vikings stadium is moving forward and a mayor cannot preside over a hole in the ground. We need to make the best of a bad situation, and the Vikings stadium is an opportunity to create high-quality jobs and to catalyze downtown growth. \n</p><p>\nThe mayor’s vision must be bigger than just the stadium. As mayor, I will advocate to ensure transparency, full community participation and a focus on spurring development beyond the stadium to create tax base to pay for the project. I will lead the city in engaging businesses and our neighborhoods to transcend the project and build our city and our tax base in east downtown, connecting it to the river, campus and to the neighborhoods to the south.  \n</p><p>\nA related opportunity that we have with the Vikings stadium project and growing the Downtown East neighborhood is to connect the jobs being created to the members in our community who need the jobs the most. I plan to ensure that we maximize the public benefit of the stadium development to help us close the jobs gap in our city.\n</p>","summary-4":"I have full faith and confidence in Chief Harteau. ","question-4":"<p>I have full faith and confidence in Chief Harteau, and I have been impressed by her proactive work to change the culture of the Minneapolis Police Department. Her commitment to that change is commendable. Most members of the Minneapolis Police Department (MPD) serve our city residents and businesses every day with bravery and honor. The spate of racist incidents this summer by some police officers is disturbing and inexcusable. I am glad to see Chief Janeé Harteau committed to improving the culture inside the MPD. \n</p><p>\nAs mayor, I will work closely with the police chief to make sure that our police officers reflect the values of our community, including requiring increased training where needed, building closer police-community ties always, and imposing strong and immediate discipline when the situation calls for it. Additionally, we need to build a MPD that reflects the values and diversity of our city.\n</p>","summary-5":"While I am mayor, there will be no co-location of the bike trail, light rail and freight rail (and no shallow tunnel).","question-5":"<p>Let me start with a certainty: While I am mayor, there will be no co-location of the bike trail, light rail and freight rail (and that includes no shallow tunnel). A major transportation union has found a freight rail option that may be feasible. As things stand today, I favor opening the Locally Preferred Alternative process. As part of this, the reroute of freight rail needs also to be considered based on recent research of the United Transportation Union. This needs to happen immediately.\n</p><p>\nIf rerouting freight rail is found unfeasible, I will consider alternative routes for light rail, with a bias towards the option that is fastest and most affordable to execute. Gov. Dayton's action has slowed the process and opened up the opportunity to look at reroute options.\n</p><p>\nI remain committed to finding a solution for how to build SWLRT to connect jobs and people from downtown Minneapolis through to the southwestern suburbs. It must be done right, and in a way that does not unduly burden the city of Minneapolis. Light rail has been an unqualified success in Minneapolis, and I’m very proud of the work I did at Hennepin County as chair of the first committee that voted to move LRT forward. To continue that success, we need to get the route right.\n</p>","summary-6":"I support the proposed Nicollet-Central streetcar line and believe it will be a fantastic addition to our city’s infrastructure.","question-6":"<p>I support the proposed Nicollet-Central streetcar line and believe it will be a fantastic addition to our city’s infrastructure, tax base and livability. This is also a strategy for tax base and job growth. As the Star Tribune reported this fall, “[streetcars] are a modern mode of transit that has had significant impact in redeveloping portions of … other cities” -- including cities such as Dallas, Portland and Salt Lake City. As city-builders know, transit investments lead to housing and commercial investments. <a href=\"http://www.markforminneapolis.com/issues/create-jobs-and-drive-economic-development\" target=\"_blank\">Read more about my thinking and experience here</a>.\n</p><p>\nMy transit philosophy is built around balance and building an interconnected transportation system that improves mobility in every corner of the city for every community, so that it becomes possible for all Minneapolis residents to live their lives utilizing a multimodal transportation system, from traveling to and from work, to getting to the grocery store, going out to a movie and getting to your kids’ piano recital. We need to encourage walking and biking – the Complete Streets model is fundamental to my view of transportation – our streets are, and must be, for everyone. \n</p><p>\nWe also need to provide excellent city services, and as mayor, I will make sure our street-repair efforts are fully funded. \n</p>","summary-7":"The most (and least) surprising is the depth of public passion for closing our opportunity and achievement gaps.","question-7":"<p>What has perhaps been the most (and least) surprising is the depth of public passion for closing our opportunity and achievement gaps, and also the very tangible hope that we can close those gaps. I’ve talked to parents, teachers, students, and concerned residents across Minneapolis, and they’ve all conveyed to me their concern, but also their hope. That passion and hope have really struck a chord for me, and it has fortified my commitment to becoming the next education mayor, so we can put our scandalous gaps behind us and become a more prosperous, vibrant and unified city.\n</p><p>\nAs the next mayor of Minneapolis, I will bring the community together to close those gaps. I recently unveiled my Growing Great Kids agenda, which lays out my proposal to close our achievement and opportunity gaps by improving our schools, creating stable housing and neighborhoods, and bringing together stakeholders to convene a Mayor’s Council on Education to create dialogue and cut through the rancor to create positive outcomes for our kids. I will also turbo-charge the existing Youth Coordinating Board to leverage state and country resources to do more for our most valuable assets — our kids.\n</p>","summary-8":"I will work to rebuild that trust among musicians, management and patrons.","question-8":"<p>The Minnesota Orchestra players have been locked out for more than a year now. That, along with the loss of Osmo Vänskä has created a serious tear in the cultural fabric of Minneapolis, and Minnesota, a tear that’s not so easily repaired. The ongoing lockout puts Minnesota Orchestra itself at risk of losing its identity and institutional integrity. Please <a href=\"http://www.markforminneapolis.com/orchestra\" target=\"_blank\">read my Sept. 19 statement here</a>.\n</p><p>\nThe ongoing labor dispute between the players and management will require rebuilding trust. As mayor, I will work to rebuild that trust among musicians, management and patrons to ensure this essential institution is thriving and growing. I am dedicated to supporting and building the Minnesota Orchestra and our entire arts community in Minneapolis.\n</p><p>\nOur community is deeply invested in a vibrant and healthy Minnesota Orchestra, and I am committed to keeping Orchestra Hall joyously full of music and audience members. I will continue to support Senator Mitchell’s mediation efforts, and I call on both sides to negotiate in good faith within the mediation process. </p>\n","rowNumber":1},{"id":2,"candidate":"Jackie Cherryhomes","image":"JackieCherryhomes250.png","summary-1":"These are not either/or choices. These are gaps that are deeply interconnected.","question-1":"<p>These are not either/or choices. These are gaps that are deeply interconnected with each other. You can’t find affordable housing without a job that pays a living wage, and you can’t get a job without a quality education. These are complex issues, and I encourage you to <a href=\"http://jackiecherryhomesformayor.com/\" target=\"_blank\">go to my website</a> to see my in-depth plan. That being said, here are three steps that I will take as Mayor to begin to address these issues:</p><p>\n1. Regarding education: On Day 1 as Mayor, I will meet with MFT, the superintendent and leaders of the reform movement. Starting from the position that all sides agree the focus must be on our families and children, we can begin the process of coming to a genuine resolution.</p><p>\n2. Regarding job creation: Reorganize and refocus the Department of Community Planning and Economic Development with an eye toward long-term city planning and job creation. Specifically I will create a position at City Hall where the sole focus is diverse job creation across the city. </p><p>\n3. Regarding Housing: Charge CPED to bring together public/private sector to identify locations/resources to build senior and affordable housing throughout the city with goal of life-cycle housing in every community. Simplify permitting process for construction of housing. This will be completed in first 100 days.</p>\n\n","summary-2":"Raising taxes is not an option for me. Property taxes are regressive.","question-2":"<p>Government has four choices in building a budget: 1. cut services 2. raise taxes 3. redesign government 4. grow the tax base. Raising taxes is not an option for me. Property taxes are regressive and disproportionately affect those least able to pay, like seniors who bought homes at a modest price and have seen their asset and taxes increase over the years.\n</p><p>\nSimilarly, taxes must not be a deterrent to growing our tax base by bringing and keeping young families in our city. As mayor, I am committed to keeping property taxes at their current level or lowering them, if possible. As mayor, my focus will be on government redesign and innovation.\n</p><p>\nI will work with employees and private sector expertise to examine each department for innovations/efficiencies. We have an opportunity to grow our tax base, but it must be planned and intentional.  I will charge CPED to work with the development community and neighborhoods to develop a strategic plan for density. We have opportunities for growth and development, along our transit corridors, vacant parking lots in downtown throughout our city, but development must be sensitive to neighborhood character.\n</p>\n","summary-3":"I have concerns about the financing plan, but with the stadium moving forward, we need to focus on how to make it work.","question-3":"<p>The public has a right to be concerned about the Vikings stadium. While I support the stadium being in Minneapolis, I have concerns about the financing plan. That being said, I believe the stadium is moving forward and we need to focus on how to make it work the best for all of us.\n</p><p>\nI think the anger about the financing is overshadowing some of the excellent work being done with regards to the stadium. As mayor, I am committed to an open/transparent process with maximum neighborhood/community participation.\n</p><p>\nAs mayor, my goals are: 1. to ensure maximum employment/contracting opportunities for city residents; 2. development that is green, sustainable, open and accessible; 3. any development around the site provides housing opportunities for all income ranges; 4. any development around the site involves employment and tax base growth. There is an excellent plan in place to ensure maximum participation in the workforce by women/minority contractors and construction workers.\n</p>\n","summary-4":"We must make it a top priority to create an environment that will not tolerate racism, bias and bullying.","question-4":"<p>To a large extent, most of our police officers handle the challenges of their work with professionalism and a genuine desire to serve the population of Minneapolis. Unfortunately, the actions of a few officers have greatly tarnished the reputation of the Minneapolis Police Department.\n</p><p>\nI believe that Chief Harteau has taken the correct first steps to address these issues. However, we must make it a top priority to create an environment that will not tolerate racism, bias and bullying. Officer screening, selection and training must be continually reviewed and improved. There must be clear expectations for behavior, including policies for swift disciplinary action with problem officers.\n</p><p>\nThe Office of Police Conduct Review is as not as strong as it needs to be, and I am concerned with any process that allows the chief of police to have a tie-breaking vote. As mayor, I would restore the Civilian Police Review Board, working with the community to structure the board in a way that brings attorneys, retired police officers and nonprofit agencies together under a citizen chair.\n</p><p>\nI do not believe it is appropriate to address the retention of Chief Harteau at this time, or in this forum.\n</p>\n","summary-5":"I have serious reservations about the shallow tunnel and its impact.","question-5":"<p>I support the leadership provided by Mayor Rybak on this critical issue. I will follow his leadership by being an active participant in the SWLRT process. I am very familiar with all the issues relating to the SWLRT, having worked on this route for the past seven years for clients in my consulting business. Having represented interested neighbors, I fully understand the issues.\n</p><p>\nI support the decision by Gov. Dayton to re-examine the options for the route as it goes through St. Louis Park/Minneapolis. Promises were made to the Minneapolis neighborhoods many years ago that the freight rail would be relocated. Unfortunately, those promises were not codified in a document that can now be relied upon.\n</p><p>\nI have serious reservations about the shallow tunnel and its impact on the lakes and affected neighborhoods. As mayor, the first key decision will come after the 90-day study period. That decision will be whether or not to support the proposed route. My overarching principle in making a decision will be to not impact our lakes and natural resources and to minimize any impact to our neighborhoods. As mayor, I will ensure maximum participation for the neighborhoods before making that decision. I will work the Minneapolis Park and Recreation Board and the council members for the affected communities.\n</p>\n","summary-6":"I support the idea of streetcars as part of a longer-term approach. We must also address the need for better bus service.","question-6":"<p>If our city is to grow, we must have a transit system that works for all its residents. Minneapolis must create a functioning multi-modal transit system that connects people to jobs and to each other. We cannot rely on a one-size-fits-all solution to our transit problems.\n</p><p>\nFirst, I support the idea of streetcars as part of a longer-term approach. However, we must review both the financing package and determine who will run the streetcars. Building a multi-modal transit system should be done in partnership with the Met Council and the State of Minnesota. Minneapolis taxpayers should not be responsible for paying for a transit system separate from the larger system.\n</p><p>\nSecond, we must address the need for better bus service. As it stands, North and Northeast Minneapolis are effectively cut off from the rest of the city, and from the greater Metro area where many jobs are. As mayor, I will partner with Metro Transit to determine how we can create safer, more effective services, and I will ask the Met Council to review all routes and ridership information to assess whether there are better ways to serve the community.\n</p>","summary-7":"One of my strengths is the ability to find common ground among various education groups.","question-7":"<p>During this campaign, I have discussed education strategies with MPS leadership, the MFT and members of the education reform movement. Everyone has good ideas and is committed to providing an excellent education for our students.\n</p><p>\nWhat has surprised me is the anger and the misinformation each has about the other. One of my strengths is my ability to bring people together, to build consensus and find common ground. I see an opportunity to do that here. The positions are not that far apart – the rhetoric has gotten in the way of finding consensus. As mayor, I believe I can bring the parties together and bridge the gaps.\n</p>\n","summary-8":"I would convene a task force with two goals: to get the orchestra playing again, and to create a proper funding stream.","question-8":"<p>Recently I held a joint press conference with former Council Member Dan Cohen and Gov. Carlson around this very issue. The Minnesota Orchestra is the crown jewel of our city, and we cannot allow the lockout to continue. A great city must have a great orchestra.\n</p><p>\nThe Minnesota Orchestra is a strong draw for our existing community as well as an attracter to bringing new residents and new businesses to Minneapolis. As a community, we must support the arts even as we support professional sports. Before taking office, I would convene a task force and I would ask Gov. Carlson to take the lead. This task force would have two primary goals: first, to get the orchestra playing again. Second, to create a proper funding stream to avoid a recurrence of this situation.\n</p>","rowNumber":2},{"id":3,"candidate":"Dan Cohen","image":"dancohen250.jpg","summary-1":"The real gap is an economic gap, a rich/poor gap.","question-1":"<p>If I read the questions correctly, I get my choice of gaps. OK, I choose the education/achievement gap. I have written and commented on this several times, but I'll have another go at it here.\n</p><p>\nConventional wisdom is that this is a racial gap, black/white. I beg to differ. In the first place, I believe this stigmatizes black kids and makes it even harder to close the real gap. In the second place, despite all the programs and rhetoric, we have been unable to close the gap on the basis of this black/white premise.\n</p><p>\nIn my opinion, that is because this is a false premise. The real gap, in my opinion, is an economic gap, a rich/poor gap. Kids from two-income, two-parent families, regardless of race, do better in school than kids in single-income, single-parent households. I cite “Coming Apart” by Charles Murray and the Maslow Hierarchy of Need.\n</p><p>\nIn single-parent households, the parent is usually a mom, working long hours, often with little time and energy left at the end of a tough day, to provide the kids with the kind of parental oversight and family experiences that a kid in a two-parent, two-income family gets. In addition, a kid that does not know where his or her next meal is coming from, or it’s just a bag of chips, may not even be certain there is a home to come home to, and is not going to be motivated to do well in school.\n </p><p>\nThat kid also will not have the cool clothes and good stuff that his or her peer groups with two-parent income and two-parent families possess, another motivating factor for school performance.\n </p><p>\nThe solution to this situation is to find jobs for absent dads and get them back in the home. They are not absent because they are morally depraved. They are absent because they can't support a family. Dads, the same as everyone else, enjoy family life. A strong jobs/growth program will help solve that problem and provide kids with the family support and the income that will help them concentrate on school, rather than fundamental human needs and they will get better grades and close the achievement gap.\n</p><p>\nIs this the only answer to the problem? No, of course not. It is just one answer. Should we abandon the black/white programs? No, they may kick in. But it's time to try a different approach, and that is what I am suggesting here.\n</p>\n","summary-2":"The key is cutting foolish and unnecessary spending and vigorously pursuing a jobs policy.","question-2":"<p>I'll quote myself from my flier for this one: The key to lowering property taxes is cutting foolish and unnecessary spending and vigorously pursuing a jobs policy that will spread the cost of government over a growing population.\n</p><p>\nOn spending, I oppose adding streetcars to our transit mix. They are not an advancement; they are a throwback. Ninety percent of our transit needs have already been met by buses. (The Strib says 85, the mayor says 90). Buses can do the last 10 percent as well.\n</p><p>\nAlso, we should not be laying the burden of half a billion dollars for the Viking stadium deal on the backs of Minnesota taxpayers, whether in the form of income taxes or property taxes or both. We need a much better deal than this one. Minnesota has the lowest rate of starting new businesses of any state in the nation (Strib, 4/20). We need new businesses and the jobs that come with them.\n</p><p>\nFor starters, I support a downtown casino. It will create hundreds and hundreds of jobs. It will be a tax-paying machine, generating property taxes, personal income taxes, corporate income taxes, operating fees and licensing fees, as well as serving as a year-round tourist attraction. I would add that we already have a downtown casino in Duluth and a federal judge just laid a $10.4 million judgment on the Chippewa tribe, payable to the City of Duluth. Don't like property taxes? Well, the mayor of Duluth says he's going to use the money to fix the streets. In Minneapolis, we use property tax money, and we don't fix the streets.\n</p>\n","summary-3":"Give the people the vote, instead of giving them the bill.","question-3":"<p>Well, I'd start with giving the people the vote, instead of giving them the bill -- and the shaft.</p>","summary-4":"Police misconduct is a case where city officials should have spoken with one voice","question-4":"<p>Another issue I've covered at some length. To start with, the cops who made the stupid, racist remarks in the Green Bay and Apple Valley incidents should have been fired on the spot, their lockers cleaned out, and their stuff put out on the sidewalk.\n</p><p>\nInstead, everyone, the chief, the mayor, various members of the council, myself included, all ran off in different directions, and so far as I know, after the usual calls for more study, more training, 0ore this, more that, nothing was done to stop this sort of behavior in its tracks.\n</p><p>\nThis was a case where city officials should have spoken with one voice -- the mayor, the chief, every council member, all the candidates -- one voice. We should have a crisis management committee to deal with these kind of incidents, responsibilities clearly assigned, and a unified single voice, representing every nook and cranny at City Hall, speaking out and saying what needed to said and what was never said, and that is this: There is not a single institution in this country that would have tolerated this behavior. It is particularly intolerable when it is cops, because the mission of the  police department is totally dependent on the good will and support of the public, particularly minority citizens, to perform its function effectively. Engage in this kind of behavior, and YOU ARE GONE.\n</p><p>\nAs for candidates for various jobs, nice try, but it is illegal to promise anyone a job when you run for public office. If I am mayor, I will interview candidates. I will consult with people whose opinion I respect. Tony Bouza has an opinion. I read about it in the June issue of the Southside Pride. I will talk with him. Maybe I will try to lure him back from retirement. He will say 'no.\" But even if his lips say, \"No ,no,\" I will take a close look and see if his eyes say, \"Yes,yes.\" We'll see.  \n</p>\n","summary-5":"I oppose co-location. The Midtown Greenway alternative route needs to be explored.","question-5":"<p>There's a 90-day hiatus here, courtesy of the governor. I concur with the mayor's \"no\" vote. Let's see what they come up with this time. I oppose co-location. Some experts say that freight trains can't make the grades and turns in St. Louis Park. Some experts say they can. \n</p><p>\nThe geological problems posed by soil and water table conditions have not been satisfactorily resolved. Even as we speak, there is flooding and digging going on at  the site of the lagoon between Lake of the Isles and Calhoun where the basement of a new apartment building at Lake and Knox has flooded and it appears there was water pumped into the lagoon.\n</p><p>\nThis could compromise the so-called tunnel solutions, along with the possibility of 900 daily hoots and whistles from the train and no station in the city. The Midtown Greenway has been suggested as an alternative route. That needs to be explored.\n</p><p>\nWhat am I likely to do if I don't like the answer? I'm a lawyer. What do lawyers do when they don't like something? \n</p>\n","summary-6":"Expanded bus service. Streetcars are an expensive toy that we can ill afford.","question-6":"<p>Expanded bus service. As I noted previously, 85 or 90 percent of our transit needs are already being met by buses. They can finish the fraction of the job still needed. One of the mayoral candidates who isn't given much attention, but should be, is a civil engineer named Bob Carney. His idea is small, 15-passenger buses that, unlike our big monster buses, can navigate narrow neighborhood streets, have low emissions and would run on schedules as frequent as every five minutes, so people don't have to freeze to death waiting for transit downtown in the dead of winter.\n</p><p>\nParticularly since the proposed route ends up at the back end of the KMart that has been blocking Nicollet Avenue southward from Lake Street for the last 30 or so years. The best vote I ever cast in public office was my vote against this civic disaster. If somehow the streetcar could be the tool that blasts through the back end of that KMart so we could finally revive Nicollet as a commercial corridor between Lake and 42nd Street, I might, in a weak moment, reconsider, but I'm not there now, and I do not believe that streetcars will revitalize Broadway.   \n</p>","summary-7":"The \"most surprising\" thing is that nothing surprises me anymore.","question-7":"<p>Well, I've already answered that one in Question 1. The added wrinkle here that is \"most surprising\" is that nothing surprises me anymore.</p>","summary-8":"The Minnesota Orchestra is an economic and cultural asset. I will [work] to save the Minnesota Orchestra. ","question-8":"<p>Now here is one situation that does surprise me. With $500 million laid on the Minnesota taxpayers' backs for the Viking stadium so we can do business with a \"civil racketeer,\" and $200 million for an unnecessary toy like streetcars, we are overlooking our most immediate and essential civic asset, the Minnesota Orchestra, with an immediate need of $6 million if it is to keep functioning until a permanent solution can be found.\n</p><p>\nThis is an institution that is a worldwide advertisement for Minnesota as a cultural center of the first magnitude. Last year, the Minnesota Orchestra performed to an audience of 300,000, and 70,000 attended free concerts. The Vikings performed to an audience of 500,000, and nothing is free. Tickets to a Minnesota Orchestra performance cost less than tickets to the Minnesota Vikings.\n</p><p>\nThe Minnesota Orchestra is an economic as well as a cultural asset. It is a major draw for attracting the kind of highly skilled unique talents we need to sustain and grow our economy.  And shall we compare the relative quality of Minnesota Orchestra performances with those of the Minnesota Vikings? We cannot afford to lose the Minnesota Orchestra.\n</p><p>\nFortunately, we have the leadership of one of those exceptional leaders that Minnesota produces, former Gov. Arne Carlson, who is prepared to storm the gates of any gate you can think of if that's what it takes to get the money we need to get this job done. I am signed on, body and soul, and as mayor, I will hector, harass, beg, plead with all of the city, county and state powers that be to save the Minnesota Orchestra. \n </p>\n\n","rowNumber":3},{"id":4,"candidate":"Bob Fine","image":"BobFine250.png","summary-1":"We need to improve the economic climate in various parts of Minneapolis to eliminate the gaps. ","question-1":"<p>We need to improve the economic climate in various parts of Minneapolis to eliminate the gaps in employment, housing and education. To do this, we need to focus on bringing business to the city, specifically focusing on attracting business to disinvested areas, such as West Broadway Avenue. As mayor, I will meet with executives of companies, both large and small, to explore how we can attract these businesses to Minneapolis by reducing taxes, lessening regulations and offering incentives. With an increase in business in underserved neighborhoods, more quality jobs will be available to people in these neighborhoods. \n</p><p>\nIt also is important to make sure Minneapolis residents have the proper training to be ready for these quality jobs. This training starts with great public schools and job training programs. We must hold principals and administrators accountable to support and fairly evaluate teachers. And teachers must receive proper cultural competency training, use challenging curriculum.\n</p>\n","summary-2":"We need to reduce inefficiencies in government, as we have done with the Park Board. ","question-2":"<p>To prevent yearly increase in taxes, we need to reduce inefficiencies in government, as we have done with the Park Board. If the government runs more efficiently, we can return money to taxpayers without compromising core services provided by the city. We also need to explore how we can increase revenue.\n</p><p>\nWe also must make every effort not to increase spending. The mayor is proposing a 1 percent decrease in taxes for next year, but the proposal includes an increase in spending by $24 million. How is that? The city is getting an increase in state aid, has money left over from over-budgeting last year and additional items. The additional state aid should be returned to taxpayers. \n</p>\n","summary-3":"I will use my background in real estate development and real estate law as an asset. ","question-3":"<p>It is apparent the Vikings stadium will likely proceed, and we need the best possible scenario going ahead for Minneapolis residents and taxpayers. I will use my background in real estate development and real estate law as an asset and will invite stakeholders to the table to make sure development is equitable and sustainable. This includes continuing to work with HIRE Minnesota to ensure people of color have opportunities to get jobs and job training. When discussing a central park in downtown, the Park Board must be part of the conversation. </p>","summary-4":"The high-profile controversies are unacceptable, as well as the large payouts to settle lawsuits. ","question-4":"<p>The high-profile controversies are unacceptable, as well as the large payouts to settle lawsuits over the past few years. We must better focus police toward community policing and on crimes that affect people. The police must work harder to establish trust between the force and communities or else effective policing will continue to be elusive in certain communities that are affected. As mayor, I will sit down with the chief to determine whether and how she would meet those priorities before making a determination about retention. </p>","summary-5":"As a Park Board commissioner, I took the position against co-location of freight and rail.","question-5":"<p>On Southwest LRT, we need to have a meeting of the government entities that are affected to examine all viable options in order to resolve the issue. I also agree with Gov. Dayton, that we need to include all affected neighborhoods in the decision-making process. As a Park Board commissioner, I took the position against co-location of freight and rail and am specifically concerned about the cost and environmental effect of a deep tunnel by Kenilworth Trail. If elected mayor and unhappy with the route, I would represent what is in the best interests of the city. If it is not in the best interests of the city, I would try to resolve reasonable differences or, barring that, consider an option involving the courts.</p>","summary-6":"I favor expanded bus service over electric streetcars. ","question-6":"<p>I favor expanded bus service over electric streetcars, which is a luxury we cannot afford. The argument that it will increase business or even tourism does not hold any weight, and government should not be in the business of determining what will increase business. There has been no showing of how this will help business or support from the business community affected. Just the potential construction on Nicollet could wipe out most existing business, not to mention failing to provide access to business. My transportation plan is to provide more equitable, safe, and economically viable options, so that people can commute easily by bike, light rail, and bus. </p>","summary-7":"The most surprising thing is to see residents make this a major issue in the mayor’s race.","question-7":"<p>With my grandson now attending Minneapolis public schools, the fifth generation in my family in Minneapolis public schools, I have interest in pushing schools to reduce this gap. I am not surprised with the achievement gap or poor graduation rates of communities of color. The most surprising thing is to see residents make this a major issue in the mayor’s race when I have not seen this kind of concern in the school board races. It is time the election of the School Board come during the same cycle as other municipal offices and not be separated out and thus less visible.</p>","summary-8":"The mayor should have shown leadership when the walkout first began.","question-8":"<p>The mayor should have shown leadership when the walkout first began, getting the parties together to try to resolve the issues, putting the financial issues up front. I have a strong background in finance and would have personally involved the mayor's office to have negotiations months ago. My only hope is that it is not too late, and if there appears no resolution, I would make it a priority to put the focus on this great cultural institution in January, with the hope it is not too late to repair the damage.</p>","rowNumber":4},{"id":5,"candidate":"Betsy Hodges","image":"BetsyHodges250.png","summary-1":"I look forward to partnering with community stakeholders to eliminate opportunity gaps.","question-1":"<p>I look forward to partnering with the schools and with every community stakeholder to eliminate the opportunity gaps between white students and students of color. I look forward to working with parents, teachers, schools, nonprofits, philanthropy, business and government to prepare every child in every neighborhood for the jobs of the future. And I look forward to working with and supporting Superintendent Bernadeia Johnson in her goal to shift our system for kids’ futures.\n</p><p>\nThe next mayor must be ready to lead a conversation among diverse partners so that together, we can deliver the people, programs and innovations that work for our children – like more time in school, more diverse teachers, more flexible education standards, and more. That means putting children ahead of adult-centered conflicts to transform our debate into a child-centered, constructive conversation.\n</p><p>\nI as mayor can have a direct impact beyond leading the conversation about our schools. There are two broad things I will do to directly, positively impact children’s lives and education. The first is to address broader opportunity gaps, such as housing, transit, income, and health and public safety services. I will continue to lead on those issues as I have on the City Council. \n</p><p>\nThe other place I as mayor will have direct impact on school outcomes is specific interventions. This is why I have introduced my Cradle-to-K platform. Together with our partners, I will expand access to prenatal care city-wide. I will increase access to stable, high quality, child-centered day care. And I will create a mayoral cabinet to bring the public, private and nonprofit sectors together to ensure there are no early-childhood programming or coverage gaps and to share resources and best practices.</p>\n","summary-2":"I have a real plan to grow Minneapolis’ population. ","question-2":"<p>First, I will do what I have been doing for eight years: taking care of our bottom line. As a result of that work, in partnership with Mayor R.T. Rybak, I voted this year for a 1 percent decrease in the property tax levy. I fought hard for pension reform, which saved us $20 million in 2012 alone. I have fought for years for a strong fiscal relationship with the state and am proud of this year’s increase in Local Government Aid. I successfully proposed the creation of the Property Tax Stabilization Fund, a place for the city to put one-time dollars to help create flexibility in our tax policy; this year it has $7 million in it and is one of the many reasons we will be able to decrease the levy. \n</p><p>\nI am the only candidate to stand up in City Council to oppose public dollars for the new Vikings stadium. I am also the only person who opposed the stadium to sit on the implementation committee – because I will be there to protect our priorities and taxpayer dollars, no matter what. In addition, I will continue leading on our successful fight for Local Government Aid from the state as mayor, just as I led on that fight in my role as president of the Minnesota League of Cities. \n</p><p>\nEven more importantly, I have a real plan to grow Minneapolis’ population back to more than 500,000 by building a more livable, efficient, densely populated city. We are building the city people want to live in and want to work in, and we are going to keep building it even better. Particularly with the addition of densely populated rail transit corridors throughout Minneapolis, our tax base will grow quickly but sustainably, relieving the tax burden on all Minneapolis residents.</p>\n\n","summary-3":"I am the only mayoral candidate to have stood up in City Council against the Vikings stadium deal.","question-3":"<p>I am the only mayoral candidate to have stood up in City Council against the Vikings stadium deal, and I will always put a priority on investments in the common ground – education, transportation, housing, and more – instead of corporate handouts. But I am also the only stadium opponent to sit on the stadium implementation committee. Now that we are moving forward, I want to use this moment to leverage the stadium into as much economic development as we possibly can. </p><p>\nIt is time for everyone to get on the same page. We can all get behind development in Downtown East, and I will invite everyone’s participation in making that our focus. In addition, now that my colleagues and I successfully fought to fairly distribute stadium construction jobs so that minorities and folks from every neighborhood are involved, I will also focus on making sure jobs at the stadium are fairly distributed going forward – just as I did during my work on the implementation committee.  I have worked with and spoken with a multitude of stakeholders who are determined to see Downtown East become a center of economic development and a new frontier for our commercial, creative, and food and beverage economies.</p>\n","summary-4":"I have led the fight to bring body-worn police cameras to the MPD.","question-4":"<p>I am the only candidate to have released a police accountability plan immediately following the most recent incidents of racially biased policing, and I have led the fight to bring body-worn police cameras to the Minneapolis Police Department. I have also made our police and public safety a budget priority, and will lead as mayor on making every street in every neighborhood a safe place for Minneapolis families and businesses.\n</p><p>\nI have worked with Chief Harteau as the City Council’s Ways and Means/Budget Committee chair, and look forward to continuing to work with her as mayor. She is a talented official who understand the department and knows how to continue improving its culture and relationship with our community. I know that together, we will continue to make having a nation-leading police department in high tech a top priority, and working together, we will be leaders in creating a nation-leading police department in “high touch,” partnering and building lasting trust with the community to make public safety a priority for all of us.\n</p><p>\nFinally, my view of public safety means more than just fantastic, connected, state-of-the-art law enforcement. I take a holistic view that means code and regulatory enforcement, animal control and other public-safety endeavors will also lead the way into an even brighter future for safety in Minneapolis.</p>\n","summary-5":"I will call for a more informed choice before we make an irrevocable decision about our city’s environmental future.","question-5":"<p>I will continue being one of the loudest voices calling for the opportunity to make a more informed choice before we make an irrevocable decision about our city’s environmental future and the future of its growth and connectedness. I know the Southwest light-rail line to be one of the most important next steps in transit for our city, and I will keep the process moving forward. But I will also keep asking whether we are getting the best deal we can for $1.5 billion.\n</p><p>I am extremely proud of my record on and vision for transit, which has included my overwhelming support for modern streetcars and LRT. A robust transit network and densely populated transit corridors are central to my vision for a more livable, more densely populated, more equitable Minneapolis where everyone has a greater chance for success. Rail transit in particular – LRT and streetcars – are not only ways to get from place to place but are also huge economic development generators and therefore central to my vision for transit.</p><p>\nPermanent investments in our transit network will make our city more environmentally friendly and reduce the need to own a car, incentivizing young people and seniors to stay in Minneapolis. Transit will connect jobs and educational opportunities to the people who need them, bringing us closer to eliminating the gaps between white people and people of color, between haves and have-nots. Densely populated transit corridors will be an engine of economic development, and an efficient way of making Minneapolis more livable for its residents and expanding our tax base.</p>\n","summary-6":"I have been and remain a champion for Minneapolis’ future with modern streetcars.","question-6":"<p>I have been and remain a champion for Minneapolis’ future with modern streetcars and believe Nicollet/Central is the correct place to start – and I will work hard to make it happen as mayor. The West Broadway streetcar line is an important next line – it will connect North Minneapolis to the Bottineau light rail line and to the rest of the city. It will bring people to jobs, but also jobs to people. </p><p>\nExpanding transit infrastructure through light rail and streetcars will take time. We need to help get people to jobs now. I worked with others to accelerate improvements in bus speed and service along two crucial routes, and will build on that progress as mayor. But investors are more confident building near rails than near bus lines – they know the rail line will be there in a generation.  That makes rail transit – LRT and modern streetcars – crucial economic development generators. I helped create and update Access Minneapolis, the city’s long-range plan for transit. It remains an important vision for Minneapolis’ future.\n</p>\n","summary-7":"At the grass-roots level, our community is united behind a desire to put our kids first.","question-7":"<p>Knowing how rancorous and bitter the education debate has become for those who have led the most embattled, adult-centered debates, it can feel like we as a society are divided on how to do the right thing by our children. But speaking with everyday families in our community, I have been reminded every day of what I instinctively believed all along: At the grass-roots level, our community is united behind a desire to put our kids first and end this adult-centered debate.</p><p>\nIn that sense, it is Minneapolis’ people – the reason I love this city – that have shaped my leadership style when it comes to education. Our families teach us every day that we can transform adult-centered debates into child-centered conversations. Minneapolis families do it in their households every day, from balancing the load that parents carry to their positions on the policies that will guide the future of our city. \n</p>\n","summary-8":"I will make sure we are working every day on ensuring Minneapolis has a world-class orchestra.","question-8":"<p>I will keep doing what I’ve been doing and leverage my new position to make sure we keep focused and working every day on ensuring Minneapolis has a world-class orchestra. Since the lockout began, I have co-authored a City Council resolution to keep the process moving, stood with the musicians and called on negotiations to continue using reasonable terms. As mayor, I will be able to leverage my current and new relationships to keep the process moving forward in a fair and civil fashion. We cannot afford to lose one of the greatest treasures of Minneapolis, one of the nation’s leading creative, artistic, and cultural destinations.</p>","rowNumber":5},{"id":6,"candidate":"Don Samuels","image":"DonSamuels250.png","summary-1":"My plan is to use objective data to determine decisions in education.","question-1":"<p>My plan for closing the achievement gap isn't some abstract or insufficient theory. It's a combination of experiences and efforts that have objectively worked elsewhere. I created the organization that would later become the Northside Achievement Zone (that my wife now runs), which is focused on closing the achievement gap. We know what works. We just need leadership.\n</p><p>\nMayor Rybak recently said, \"[Don Samuels] has created what is the boldest plan for addressing the achievement gap, and I know he has the guts to follow through.\" Because we know what works, it's going to take courageous leadership to actually take those good ideas and make them a reality.\n</p><p>\nMy plan for closing the achievement gap is to use objective data to determine decisions in education. By doing that, we know what the gaps are and know when we are making progress to close them. My plan includes increased support for struggling schools, support for innovative efforts and bringing to light some of the unknown decisions that impact our kids. For far too long, we've been wedded to how we want things to work, as opposed to how they actually work. I'll be the mayor that leads the necessary changes to start significantly closing gaps. <a href=\"http://samuelsformayor.com/?q=Education\" target=\"_blank\">My full education plan can be seen here</a>. \n</p>","summary-2":"We must continue to drive down crime to save on long-term incarceration and policing costs.","question-2":"<p>Continued cuts in Local Government Aid, significant amount of debt left for us by questionable decisions made during the 1990s, exponentially increasing pressure on future liabilities and the upward pressure of costs put the city and taxpayers in a tough spot. By working with Mayor Rybak and my colleagues on the council, we were able to stabilize our financial situation, and should be able to hold the line on property taxes.\n</p><p>\nIn fact, in his last budget speech, Mayor Rybak proposed the first cut to property taxes in 20 years, and said that I was his one stalwart partner on every decision over the last decade that got us to this point. I’m proud of the work we’ve done together, but there is still much to do.\n</p><p>\nLong term, we have three structural issues that will force increased property taxes if we don't address them. We must continue to drive down crime through preventive and intervention strategies, so we can save on long-term incarceration and policing costs. Second, we must achieve better educational outcomes for our children, so that every person is able to get a living-wage job and contribute to the tax base. As long as inequities exist in the quality of our schools and the safety of our streets, taxes from certain parts of the city will be subsidizing services in others. That’s unsustainable. Lastly, we must grow the population of our city back to more than 500,000 people by investing in infrastructure that will enable that growth to happen smoothly. \n</p>","summary-3":"I'll make sure that every resident understands the citywide benefits made possible by the Vikings stadium deal.","question-3":"<p>Mayor Rybak and I worked closely on the stadium deal and built support by discussing the shared benefits of the deal. For example, the structure of the deal allowed Mayor Rybak to propose a property tax cut for the first time in two decades. We also instituted the most aggressive minority hiring goals in Minneapolis history on this project, which will insist upon appropriate representation from communities who most need access to a strong career in the trades.\n</p><p>\nSome question whether these goals will be met, so I will ensure that progress toward this goal is constantly monitored, and that the information is reported out to the community on a regular basis. In addition, we have now seen unprecedented levels of private investment in Downtown East, such as the $400 million project from Ryan Companies to replace sprawling surface parking into another hub of business, residential and recreational space.  Regular communication will be critical, and as mayor, I'll make sure that every resident understands the citywide benefits made possible because of the Vikings stadium deal. \n</p>","summary-4":"I believe she has led the police department with class, thoughtfulness and courage.","question-4":"<p>As mayor, I think it's critically important to set the tone for what is and is not acceptable. I will clearly and repeatedly proclaim the city’s commitment to treating all citizens with dignity and respect. My experience and leadership in public safety helps me set expectations and hold people accountable.\n</p><p>\nThat's what I did when I called for the resignation of two off-duty Minneapolis police officers who used derogatory language towards the African-American and LGBT communities. In addition, I'll work with the police union and Chief Harteau to provide the chief with the authority necessary to get rid of the bad apples. I will also pay close attention to the performance of the oversight function to make sure that we are actually seeing improvements.  \n</p><p>\nI was a big supporter of the chiefs first bid and believe she has led the police department with class, thoughtfulness and courage. She has shown a commitment to a safe community, but also a commitment to changing the ways things operate. She has insisted that cops get out of their cars and meet the community, that they develop relationships with community members and that they police with transparency and integrity.  I am committed to retaining her as police chief. \n</p>","summary-5":"There were multiple routes, including one through Uptown, that would have much better inherent ridership. ","question-5":"<p>As mayor, I believe granting local consent for Southwest LRT needs to be based on objective data. Right now, the Metropolitan Council is asking the city to provide municipal consent for a project when we don't have all the information. For example, we don't know what the potential environmental impacts a shallow tunnel would have on our lakes. Until we have the objective data to be able to make informed decisions, I will oppose any implementation plan.\n </p><p>\nBut, generally on Southwest LRT, I believe that co-location in the Kenilworth Corridor is not a serious option. Given the impasse with St Louis Park over relocation of the freight line, limited space at grade, and the environmental and financial unknowns associated with the shallow tunnel proposal, it is becoming increasingly evident that the current plan is not viable.\n</p><p>\nThere were multiple routes, including one through Uptown that have previously been supported by Mayor Rybak, that would have much better inherent ridership, but they were dismissed because of cost.  Now that the expected cost of the project through the Kenilworth Corridor has risen by hundreds of millions of dollars, it is time to take a step back and reconsider all options.\n</p>","summary-6":"I favor the investment in streetcars over a proposed increase in bus service.","question-6":"<p>I favor the implementation of streetcars on Central Avenue. The reason why I support the investment in streetcars over a proposed increase in bus service is because streetcars facilitate transformational private investment and economic development along their corridors that bus routes don't. This isn't just theory; there are case studies around the nation.\n</p><p>\nIn the case of Portland, they saw $3.5 billion in private investment along the streetcar corridor; Los Angeles saw $1.1 billion of private investment in addition to more than 9,300 jobs created. We know this works. When investors and developers have certainty about where people will be, they will invest. Rail provides much more certainty than rubber. \n</p><p>\nMy philosophy on transit is to create a multimodal transit system that connects single-family residential neighborhoods with dense, mass-transit corridors in a seamless manner. The lack of such a transit system is one of the glaring differences between Minneapolis and other thriving cities around the country.\n</p>","summary-7":"I may be the only candidate who isn’t surprised by the prominence of education as a key issue. ","question-7":"<p>I may be the only candidate in this race who isn’t surprised by the prominence of education as a key issue. Since this campaign began, I have been talking about the critical importance of a good education for every child to eliminating the gaps in our city, reducing crime in our neighborhoods and ensuring the future economic viability of Minneapolis. If anything, I was most surprised by how long it took most of my opponents to also make this a central issue of their campaigns. Several began this campaign by telling voters, “The mayor has no authority over the schools,” and that they were not running for school board.  \n</p><p>\nI am glad that now the discussion isn’t about whether the mayor should be involved in education, but how, and who can provide the appropriate leadership on this critical issue. Education is something my wife and I have been intimately involved in for years, and I am proud that because of our leadership, I was able to earn Mayor Rybak’s blessing on this issue, who recently that I have “the boldest plan for addressing the achievement gap ... [and] the guts to follow through.”\n</p><p>\nBy seeing how much passion there is across the city around closing the achievement gap, I am more committed than ever to doing whatever is necessary to ensure every single child has access to a great quality education.\n</p>","summary-8":"The two sides must come to a resolution between themselves.","question-8":"<p>Other candidates will tell you that we must put public funds into the orchestra to save it. I don't think that is a sustainable solution.\n</p><p>\nAs Mayor Rybak said, this is a dispute that no elected official can unilaterally solve. There are two sides to this impasse that must come to a resolution between themselves. They are highly vested in the outcome and any long-term, sustainable solution must come from the parties involved. \n</p>","rowNumber":6},{"id":7,"candidate":"Cam Winton","image":"CamWinton250.png","summary-1":"I’ll lead stakeholders in five key initiatives and use the mayor’s megaphone to seek direct appointments to the school board.","question-1":"<p>To close the gap in academic opportunity and achievement, I’ll lead all stakeholders in five key initiatives: </p><p>\n1. Reduce red tape to make it easier for real businesses to create real jobs — because when parents have paychecks, they have the peace of mind to guide their children’s education more effectively. </p><p>\n2. Challenge parents — especially my fellow fathers — to step up with me in creating stable homes for all of our city’s children. </p><p>\n3. Increase public safety in our neighborhoods by giving public safety officers the resources they need (including by fully staffing the police department). When children arrive at school feeling safe, they’re better able to learn. </p><p>\n4. Implement education reform policies: a) end the “last-in, first-out” policy, which prioritizes clock-punching over excellence; b) tie teacher pay to performance, just as I would tie my mayoral pay to performance; c) increase instructional time through a combination of longer school days and years; and d) analyze data on a routine basis to guide instruction rather than waiting for high-stakes end-of-year test results. </p><p>\n5. Continue using every available tool in our toolkit, including high-performing charter schools, Teach for America teachers, and a constant demand for excellence from administrators, teachers, parents, and students. </p><p>\nTo achieve the education policy changes, I’d use the mayor’s megaphone and seek direct appointments to the school board. </p>\n","summary-2":"I would apply common sense to improve city government’s structure, and spend less money.","question-2":"<p>1. Apply common sense to improve city government’s structure. For example, the City of Minneapolis and Hennepin County currently maintain duplicative functions, including IT, HR and procurement. I’ll lead the city in working with the county to share those services. By not filling positions as workers retire, I’ll achieve savings for city residents that would fund essential services and property tax relief.</p><p>\n2. Spend less money. When I’m mayor, we won’t buy a $53 million-per-mile streetcar line, marketing campaign to persuade city residents to drink tap water, or temporary glowing mood ring at the Convention Center. Just like the U, we’ll save millions of dollars by using Google Docs instead of overpriced enterprise software. We’ll make case-by-case decisions about whether to build bike-only sidewalks, rather than making blanket commitments to build 30 miles of them (as my opponents have done to satisfy a given voting bloc). </p><p>\nIn contrast, my fellow candidates haven’t shown any interest in improving the city government’s underlying structure, likely since they have to appease the insiders who benefit from the current system. Furthermore, most of them support building the $53 million-per-mile streetcar network. Given those commitments, there’s no way they can make good on any promise to rein in property taxes. </p>","summary-3":"I opposed the Vikings stadium deal.","question-3":"<p>I opposed the Vikings stadium deal. City taxpayers will pay $675 million for it (when we include financing costs), and there would have been better uses for that massive amount of money. The City Charter is clear that the issue should have gone to a referendum, but City Hall relied upon a questionable reading of the applicable Charter provision to do an end-run around it. </p><p>\nThe current deal is built on quicksand. I’d convene the city, state and Vikings to confirm that pledged funds are, in fact, available. Between the debacle of e-pulltab funding and the racketeering verdict against the Wilfs, it’s essential to double-check all financial assumptions underlying the deal.</p><p>  To the extent it’s legally possible to extract financial concessions from the state and Vikings at this time, I’d do so, as stadium deals in other cities recently have demonstrated that Minneapolis got a raw deal. </p><p>\nFurthermore, I’d make absolutely clear that if we proceed with the deal, Minneapolis taxpayers will not provide any additional dollars beyond those already committed. </p><p>\nRegarding real-estate development adjacent to the stadium, I’m the only candidate asking hard questions about what the city proposes to spend and what we’d get for it. It was because of my pressure earlier this year that City Hall released documentation of the deal. </p>\n","summary-4":"I'd lead the department in instituting cultural changes so each officer is empowered to call out peers for bad behavior.","question-4":"<p>1. I'd lead the department in instituting cultural changes so that each officer is empowered and obligated to call out his/her peers for bad behavior — since the strongest pressure is peer pressure. 2. Put cameras on officers to record what they see — since cities that have implemented on-body cameras have seen dramatic declines in allegations of misconduct. 3. Put more officers on bicycle patrol — since bike patrols enable greater interaction between police and residents. 4. Add additional well-trained, well-disciplined officers to ensure that the Police Department can adequately investigate rising property crime; a city our size should have 975 officers, but we only have 850.</p><p>\nFor now, I support the Office of Police Conduct Review. That said, it had better start showing results very soon or else I’ll start revising the process. I was troubled by the recent news that despite reviewing more than 400 complaints, the process has yielded zero disciplinary actions; so I’ll be watching very closely to ensure that our system is effectively restoring residents’ trust in the police department. Regarding the chief, generally speaking I’ve liked her approach of not tolerating misconduct, but I’m not going to comment specifically on personnel matters until such time as I’m mayor.  </p>\n","summary-5":"I strongly oppose co-location of freight and light rail in the Kenilworth Corridor.","question-5":"<p>I strongly oppose co-location of freight and light rail in the Kenilworth Corridor, as it would be too much of a burden on one community. I favor running the light rail down the Midtown Greenway trench (which would leave the bike & pedestrian paths undisturbed), then turning north up Nicollet to downtown. We’d have transit where people live, rather than through the woods.</p><p>\nThere is nothing binding in law holding us to the current alignment; rather, it’s simply a bureaucratic convenience. Since the time at which the Met Council decided to try to route the train down the Kenilworth Corridor, the federal funding formula and the cost assumptions have changed, so it only makes sense to re-evaluate the route. </p><p>\nSome say re-evaluating the route now would be too time-consuming and costly. In response, I note that our current course of action will lead to no project whatsoever, since either Minneapolis or St. Louis Park will deny the required municipal consent. </p><p>\nIf the Met Council proceeds with trying to route the train via shallow tunnels through the Kenilworth Corridor, I’ll lead the charge to deny municipal consent. If the Met Council tried to plow ahead with a project despite that denial, I guarantee years of protracted litigation.</p>\n","summary-6":"We don’t need streetcars to achieve our transit goals, and we can’t afford them. ","question-6":"<p>No. We don’t need streetcars to achieve our transit goals, and we can’t afford them. The proposed streetcar line would cost $53 million per mile, according to the City’s own info.  I’ve testified before City Council twice to urge it to stop spending money on this wasteful boondoggle. </p><p>\nStreetcar proponents are well intentioned but, respectfully, mistaken. They believe that a streetcar line would both move people and catalyze economic development, but those economic development claims are unproven at best. For every study that a streetcar proponent can point to showing that streetcars caused development, I can show them another study showing that other stimulus funds — not the given streetcar — were the true root cause of the given development.</p><p> \nEnhancing our bus lines (i.e., installing heated bus enclosures; installing payment machines that enable payment before boarding) for $2 million per mile is the more cost-effective way to proceed.\nFurthermore, the city's current approach to funding the streetcar uses a funding gimmick to rob funds from essential services like road maintenance, police and fire to spend on the streetcar line. </p><p>The city’s unfortunate approach even demonstrates that streetcars and economic development aren’t necessarily linked, as the funding relies on property-tax payments for parcels on which there’s already development, even in the absence of the streetcar. </p>\n","summary-7":"The current system is broken. I am open to every single approach that would help fix it.","question-7":"<p>I’ve been surprised by just how unwilling some adults are to try new approaches for providing a world-class education to all of our children. Take, for example, Teach for America. </p><p>\nTeach for America is my generation’s Peace Corps. Imagine if someone had said in 1968, “The Peace Corps should not be part of how America helps the world.”  It’s equally baffling to me today when education stakeholders say that putting razor-sharp, highly motivated recent college graduates in our least-advantaged classrooms (via Teach for America) should not be part of the solution to improving educational outcomes for all children. </p><p>\nIs it the only solution? Of course not. But to borrow a phrase from Al Gore, while there’s no magic bullet, there is magic buckshot — and that means using data-driven instruction, incentive pay for teachers and the mayor, higher expectations for all stakeholders (administrators, teachers, parents and students), longer days and years, high-performing charter schools, Teach for America teachers, and mayoral appointments to the school board by which the mayor can drive his/her reform agenda. </p><p>\nThe current system is broken. I am open to every single approach that would help fix it. Shutting out particular approaches because of ideological bias or rank self-interest is morally indefensible — and as mayor, I won’t tolerate it. </p>","summary-8":"I doubt that any one individual would be able to provide a breakthrough in the discussions.","question-8":"<p>Given that even George Mitchell, who brought peace to Northern Ireland, hasn’t been able to resolve the Orchestra lockout, I doubt that any one individual would be able to provide a breakthrough in the discussions. Rather, each side will need to make concessions. </p><p>\nHaving grown up playing violin, the Orchestra’s current troubles sadden me, but I absolutely oppose any kind of bailout. Society can’t keep turning to “government” to bail out institutions and individuals who fail to keep their affairs in order. </p><p>“Government money” comes from our pockets. Let’s focus on getting the basics right before we spend more on bells and whistles. Some say, we’ve subsidized the Vikings; why not the Orchestra? Respectfully, two wrongs don’t make a right. </p><p>\nAs mayor, I’ll make the stakes clear to the negotiating parties. Given that the Orchestra used state funds for a substantial amount of the recent renovation of Orchestra Hall, the orchestra must certify that the Hall is being used for its intended purpose. As it now stands, the orchestra couldn’t make that certification. Therefore, if the musicians and management can’t find some mutually agreeable resolution, I’d have no problem advocating for a re-purposing of the publicly funded space. \n</p>","rowNumber":7},{"id":8,"candidate":"Stephanie Woodruff","image":"StephanieWoodruff250.png","summary-1":"I will support SHIFT by leveraging our existing assets to support our kids.","question-1":"<p>I am the only candidate who cited the achievement gap as the city’s biggest challenge at the time I launched my campaign. Other candidates have promised to lobby the state and federal government for more funding. They have suggested a Mayor’s Council on the achievement gap. These are not bad ideas, but they miss the central point – the mayor must be a leader who rallies the community behind our superintendent and demands results.\n</p><p>\nI am the only candidate who has publicly supported Superintendent Johnson’s transformational SHIFT plan. SHIFT will create innovative partnership zones, increase diversity in the teaching ranks and allow schools to hire teachers who best match student needs. I will rally the community behind this transformation of our schools\n</p><p>\nI will support SHIFT by leveraging our existing assets to support our kids. I will partner with the county, School Board and Park Board to commit dollars over 10 years to create learning labs and early childhood centers in our parks. I will pay for this initiative by using the same property tax dollars that other candidates would use for three miles of the Nicollet streetcar line that does not address our transit needs. \n</p>\n","summary-2":"We must grow our city through transit investments, development of the Upper River and creating living-wage careers.","question-2":"<p>It’s time to invest in people over politics, people over projects. We must grow our city through smart transit investments, development of the Upper River and creating living-wage careers for our citizens. This will grow our tax base and reduce the pressure on property taxes.\n</p><p>\nI disagree with Council Members Hodges and Samuels on the proposed $65 million subsidy of the Ryan Development adjacent to the new Vikings stadium. This project and other development subsidies put tax dollars at risk and threaten to increase our property taxes. And I also disagree with diverting $60 million in new tax revenue to the Nicollet Mall streetcar line, which does not advance our greatest transit issues.\n</p><p>\nMinneapolis recently received a D- for financial transparency. Citizens do not know how their money is being spent. This must change. I pledge to create checkbook-level spending information so that all taxpayers can see exactly where and how their money is being spent. Transparency builds trust, and trust is the foundation for great teamwork.\n</p>\n","summary-3":"[We should] use what remains of the anticipated sales tax revenues to create a capital fund for our neighborhoods.","question-3":"<p>The dedication of almost $700 million of city funding to the Vikings stadium was a betrayal of our neighborhoods and the people most in need. My opponents who voted (or would have voted) for the stadium funding plan, have stated that they believe this is a good deal for Minneapolis. I strongly disagree. These sales tax revenues could have been used for capital projects in our neighborhoods – affordable housing, the Upper River development, neighborhood action plans, and commercial corridor redevelopment. \n</p><p>\nThe city must not make the same mistake again. The city is negotiating right now to pay for the renovation of the Target Center, using most, if not all of what is left of the anticipated sales tax revenues that could be used to improve our neighborhoods. I will not allow this to happen. The best way to bring the community together is to use what remains of the anticipated sales tax revenues to create a capital fund for our neighborhoods to invest in affordable housing and economic development in our community. \n</p>","summary-4":"I support Chief Harteau and her MPD 2.0 plan to bring transparency, accountability and integrity to the department.","question-4":"<p>I support Chief Harteau and her MPD 2.0 plan to bring transparency, accountability and integrity to the department. I will stand with the chief and support her in implementing these changes. I will hold her accountable for these results. I will also strive to make sure she has the authority to discipline officers as needed. </p>","summary-5":"I am the only candidate who has stated that I would give local consent to the current plan. ","question-5":"<p>I am the only candidate who has stated that I would give local consent to the current plan, so long as there is a thorough environmental review. The next mayor must lead the regional effort for a 21st Century transportation system. We will do great damage to our transportation future if we block this project. Federal funds will be lost, and other communities will jump ahead of us.\n</p><p>\nLeadership requires making the tough decisions and taking the heat. I will do what is best for the common good and I will not pander. That is not leadership.\n</p>","summary-6":"I would only favor streetcars if they are part of a regional transportation system with a regional funding source.","question-6":"<p>I would only favor streetcars if they are part of a regional transportation system with a regional funding source. I will not commit local property tax dollars to a streetcar line. The current proposal supported unanimously by the current council could cost up to $35 million a year in city dollars once the five “starter lines” are built.</p> ","summary-7":"It’s unacceptable that we claim to be the “city that works” when we have the largest achievement gap in America.","question-7":"<p>I learned just how bad it is! I honestly had no idea how much our kids were failing until I started to do the research. It’s unacceptable that we claim to be the “city that works” when we have the largest achievement gap in America. It’s time for new, bold leadership in the mayor’s office to stand up and demand results.</p>","summary-8":"Until I get a “complete picture of the numbers,” I can’t really comment on my next step.","question-8":"<p>Right away, I will sit down with management and get up to speed on the issue in detail, as to what is really going on with the financials. Until I get a “complete picture of the numbers,” I can’t really comment on my next step. All in all, I will be a bold leader who will demand results. </p>","rowNumber":8}],"questions":[{"id":1,"shortname":"Closing the Gap","question":"In this campaign we have heard frequent references to the gaps that separate Minneapolis residents in terms of education, employment and housing.  Explain how you, as mayor, will work to eliminate one of these gaps. (<a href=\"http://www.minnpost.com/learning-curve/2013/03/reset-effort-focuses-achievement-gap-and-shows-ways-close-it\">Learn more</a>)","rowNumber":1},{"id":2,"shortname":"Property Taxes","question":"What would you do as mayor to prevent yearly increases in property taxes? (<a href=\"http://www.startribune.com/politics/statelocal/228488671.html\">Learn more</a>)","rowNumber":2},{"id":3,"shortname":"Vikings Stadium","question":"With continuing opposition to the funding and process surrounding construction of the Vikings stadium, how would you proceed both in terms of bringing the community together and ensuring that future development in that area benefits all of Minneapolis? (<a href=\"http://www.minnpost.com/cityscape/2013/08/sorting-out-ins-and-outs-downtown-east\">Learn more</a>)","rowNumber":3},{"id":4,"shortname":"Police Chief","question":"After a year of high-profile controversies, what would you do as mayor to bring change to the Police Department, and are you likely to retain Janee Harteau as police chief?  Why? (<a href=\"http://www.minnpost.com/two-cities/2013/05/minneapolis-officials-back-police-chief-harteau-s-limited-comments-friday-events\">Learn more</a>)","rowNumber":4},{"id":5,"shortname":"SWLRT","question":"When you take office, one of your first key decisions may involve the controversial Southwest LRT line. What will you do to help influence the final route and its impact on city neighborhoods? And what will you do if you are unhappy with the route selected? (<a href=\"http://www.minnpost.com/politics-policy/2013/10/mayor-rybak-calls-intense-study-southwest-lrt-options-during-90-day-delay\">Learn more</a>) ","rowNumber":5},{"id":6,"shortname":"Streetcars","question":"Do you favor streetcars or expanded bus service for the proposed Nicollet/Central transit route -- and why? What’s your overall transit philosophy for the city? (<a href=\"http://www.minnpost.com/politics-policy/2013/09/streetcars-endorsed-minneapolis-central-nicollet-transit-line\">Learn more</a>)  ","rowNumber":6},{"id":7,"shortname":"Education","question":"With the schools and achievement gap emerging as major issues in the mayor’s race, what's the most surprising thing you've learned about education since you began campaigning, and how might it change your thinking? (<a href=\"http://www.minnpost.com/learning-curve/2013/08/why-minneapolis-mayoral-candidates-are-making-strong-schools-such-big-issue\">Learn more</a>)","rowNumber":7},{"id":8,"shortname":"Orchestra Lockout","question":"With the resignation of musical director Osmo Vänskä and the newly remodeled Orchestra Hall vacant and silent, what would you do as mayor to help resolve the dispute if the lockout is still in effect in January?  (<a href=\"http://www.minnpost.com/politics-policy/2013/09/politicians-frustrated-too-orchestra-dispute-approaches-do-or-die-weekend\">Learn more</a>)","rowNumber":8}]}}; 



mpTemplates = mpTemplates || {}; mpTemplates['minnpost-mpls-council-member-questionairre'] = {"template-application":"<div class=\"grid-container grid-parent {{ (canStore) ? 'can-store' : '' }}\">\n  <div class=\"grid-100 message-container\"></div>\n\n  <div class=\"grid-100 grid-parent content-container cf\"></div>\n\n  <div class=\"grid-100 grid-parent footnote-container\"></div>\n</div>","template-candidates":"<div class=\"question-menu grid-20 mobile-grid-35 tablet-grid-20\">\n  <div class=\"question-menu-inner\">\n    <h5>Issues</h5>\n\n    <ul>\n      {{#questions:q}}\n        <li><span class=\"link\" on-tap=\"slideTo:{{ id }}\">{{ shortname }}</span></li>\n      {{/questions}}\n    </ul>\n\n    <h5>Starred</h5>\n\n    <ul>\n      {{#candidates:c}}\n        <li class=\"{{ (maxStarred !== 0 && maxStarred === starred) ? 'favored-candidate' : '' }}\"><span class=\"starred-candidate\">{{ starred }}</span> &mdash; {{ candidate }}</li>\n      {{/candidates}}\n    </ul>\n  </div>\n</div>\n\n<div class=\"candidates-questions-answers grid-80 mobile-grid-65 tablet-grid-80\">\n  {{#questions:q}}\n    <div class=\"question grid-100 grid-parent\" id=\"question-{{ id }}\">\n      <p class=\"question-text\"><span class=\"question-title\">{{ shortname }}:</span> {{{ question }}}</p>\n\n      {{#answers:a}}\n        <div class=\"answer grid-50\" id=\"answer-{{ q }}-{{ a }}\">\n          <div class=\"answer-inner\">\n            <div class=\"answer-image\"><img src=\"{{ imagePath }}{{ image }}\" /></div>\n            <div class=\"star {{ (starred) ? 'starred' : '' }}\" on-tap=\"star:{{ q }},{{ a }}\">★</div>\n\n            <h5>{{ candidate }}</h5>\n\n            <div class=\"summary-answer\">\n              <p class=\"summary-text\"><strong>Summary</strong>: {{ summary }}</p>\n\n              {{#answer}}\n                <div class=\"answer-text\">{{{ answer }}}</div>\n\n                <div class=\"link read-more\" on-tap=\"readMore:{{ q }},{{ a }}\">Read more</div>\n              {{/answer}}\n            </div>\n          </div>\n        </div>\n      {{/answers}}\n    </div>\n  {{/questions}}\n</div>","template-footnote":"<div class=\"footnote\">\n  <p>Candidate answers were received via a questionnaire that MinnPost sent to candidates.  <span class=\"remove-local-storage\">Your starred answers are stored locally on your computer; for your privacy you can <span class=\"link remove-storage\" on-tap=\"removeStorage\" href=\"#remove\">clear your starred questions</span>.</span>  Some code, techniques, and data on <a href=\"https://github.com/MinnPost/minnpost-mpls-mayoral-questionnaire\" target=\"_blank\">Github</a>.</p>\n</div>","template-loading":"<div class=\"loading-container\">\n  <div class=\"loading\"><span>Loading...</span></div>\n</div>"};

/**
 * Main app logic for: minnpost-mpls-mayoral-questionnaire
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
          template: thisApp.template('template-footnote')
        });
        thisApp.footnoteView.app = thisApp;

        // Get data.  Can't seem to find a way to use mustache and nested
        // loops to be able to reference question ids, so that means
        // we repeat data into a question collection
        thisApp.getLocalData(['questions_answers']).done(function(data) {
          var questionsAnswers = [];
          answers = data['2013 Mayoral Questionnaire'].answers;
          questions = data['2013 Mayoral Questionnaire'].questions;

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
              imagePath: thisApp.options.imagePath,
              maxStarred: thisApp.maxStarred || 0
            },
            adaptors: [ 'Backbone' ]
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
    init: function() {
      var thisView = this;

      // Sticky sidebar
      this.sidebar();

      // Handle starrring
      this.on('star', function(e) {
        e.original.preventDefault();
        var current = this.get(e.keypath + '.starred');
        this.set(e.keypath + '.starred', (current) ? false : true);
        this.app.aggregateCandidates();
        this.app.save();
      });

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
    },

    // Sticky sidebar
    sidebar: function() {
      var thisView = this;
      var classes = 'grid-20 mobile-grid-35 tablet-grid-20';
      this.$sidebar = $('.question-menu');
      this.sidebarWidth = this.$sidebar.css('width');

      this.$sidebar.stick_in_parent({
        offset_top: 10
      });

      // Sticky kit forces a width which screws over a fluid design
      this.$sidebar.on('sticky_kit:stick', function(e) {
        thisView.$sidebar.removeClass(classes);
        thisView.$sidebar.parent().addClass(classes);
        thisView.$sidebar.parent().css({
          'width': ''
        });
      });
      this.$sidebar.on('sticky_kit:unstick', function(e) {
        thisView.$sidebar.addClass(classes);
        thisView.$sidebar.parent().removeClass(classes);
      });
    }
  });
})(mpApps['minnpost-mpls-mayoral-questionnaire'], jQuery);