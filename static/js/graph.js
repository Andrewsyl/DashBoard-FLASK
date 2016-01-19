queue()
    .defer(d3.json, "/donorsUS/projects")
    .await(makeGraphs);

function makeGraphs(error, projectsJson) {

    //clean projectionJson data
    var donorsUSProjects = projectsJson;
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
    donorsUSProjects.forEach(function (d) {
        d["date_posted"] = dateFormat.parse(d["date_posted"]);
        d["date_posted"].setDate(1);
        d["total_donations"] = +d["total_donations"];
    });


    var ndx = crossfilter(donorsUSProjects);

    var dateDim = ndx.dimension(function (d) {
        return d["date_posted"];
    });

    var resourceTypeDim = ndx.dimension(function (d) {
        return d["resource_type"];
    });

    var povertyLevelDim = ndx.dimension(function (d) {
        return d["poverty_level"];
    });

    var stateDim = ndx.dimension(function (d) {
        return d["school_state"];
    });

    var totalDonationsDim = ndx.dimension(function (d) {
        return d["total_donations"];
    });

    var fundingStatus = ndx.dimension(function (d) {
        return d["funding_status"];
    });

    var focusAreaDim = ndx.dimension(function (d) {
        return d["primary_focus_subject"];
    });

    var numProjectByFocusArea = focusAreaDim.group();
    var numProjectsByDate = dateDim.group();
    var numProjectsByResourceType = resourceTypeDim.group();
    var numProjectsByPovertyLevel = povertyLevelDim.group();
    var numProjectsByFundingStatus = fundingStatus.group();
    var totalDonationsByState = stateDim.group().reduceSum(function (d) {
        return d["total_donations"];
    });
    var stateGroup = stateDim.group();

    var all = ndx.groupAll();
    var totalDonations = ndx.groupAll().reduceSum(function (d) {
        return d["total_donations"];
    });

    var max_state = totalDonationsByState.top(1)[0].value;

//Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["date_posted"];
    var maxDate = dateDim.top(1)[0]["date_posted"];

//Charts
    var timeChart = dc.lineChart("#time-chart");
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");
    var fundingStatusChart = dc.pieChart("#funding-chart");
    var focusChart = dc.rowChart("#focus-type-row-chart")
    //var max_stateChart = dc.pieChart('#max-chart')
    selectField = dc.selectMenu('#menu-select')
        .dimension(stateDim)
        .group(stateGroup);

    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all);

    focusChart
        .width(1000)
        .height(850)
        .dimension(focusAreaDim)
        .ordinalColors(["#ff6900","#664631"])
        .group(numProjectByFocusArea)
        .xAxis().ticks(4);


    /*focusChart
     .width(1800).height(500)
     .dimension(focusAreaDim)
     .group(numProjectByFocusArea)
     //.stack(hits_2012,"2012")
     //.stack(hits_2013,"2013")
     //.renderArea(true)
     //.x(d3.time.scale().domain([minDate, maxDate]))
     //.elasticX(true)
     //.brushOn(false)
     .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
     .yAxisLabel("Hits per day")
     .ordinalColors(["#56B2EA", "#E064CD", "#F8B700", "#78CC00", "#7B71C5"])
     //.renderArea(true)
     .margins({top: 10, right: 50, bottom: 30, left: 50})
     //.colors(colorbrewer.RdYlGn[9])
     .colorDomain([0, 100])
     .colorAccessor(function (d) {
     return d.value / 100
     })
     .keyAccessor(function (p) {
     return p.value
     })
     .valueAccessor(function (p) {
     return p.value
     })
     .radiusValueAccessor(function (p) {
     return p.value
     })
     .maxBubbleRelativeSize(0.1)
     .x(d3.scale.linear().domain([0, 6000]))
     .y(d3.scale.linear().domain([0, 6000]))
     .r(d3.scale.linear().domain([0, 5000]))
     .elasticY(true)
     //.elasticX(true)
     .yAxisPadding(100)
     .xAxisPadding(500)
     .renderHorizontalGridLines(true);*/


    totalDonationsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalDonations)
        .formatNumber(d3.format(".3s"))
        .width(300);

    timeChart
        .width(1200)
        .height(300)
        .dimension(dateDim)
        .renderArea(timeChart)
        .ordinalColors(["#ff6900","#664631"])
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .group(numProjectsByDate)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(4);
    //.linearColors(["#f4c63d","#d70206","#f05b4f"])


    resourceTypeChart
        .width(350)
        .height(300)
        .ordinalColors(["#ff6900","#664631"])

        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .xAxis().ticks(4);


    povertyLevelChart
        .width(350)
        .height(300)
        .ordinalColors(["#ff6900","#664631"])
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .xAxis().ticks(4)
    //.Colors(["#f4c63d","#d70206","#f05b4f"])

    fundingStatusChart
        .height(300)
        .width(350)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectsByFundingStatus)
        .ordinalColors(["#ff6900","#664631"])
        .legend(dc.legend().x(260).y(60).itemHeight(13).gap(5));

    dc.renderAll()

};







