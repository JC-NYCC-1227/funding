$(document).ready(function(){
  const secure="yTdpNEcXki56kPgsDBxj2nuYf";
  $("#modal").iziModal({
    fullscreen:false,
    headerColor:"#2F56A6",
    onOpening:function(){$(".iziModal-content").animate({"opacity":1},1000)}
  });
  $.ajax({
    type:"GET",
    url:"https://data.cityofnewyork.us/resource/pysf-7m9i.json",
    data:{
      "$limit":10000000000,
      "$$app_token":secure
    },
    //all functions and event listeners in success function to use data and make searching and sorting much faster without hitting the API everytime.
    // values NOT used: bbl, bin, census_tract, community_board, ein, latitude, longitude, mocs_id, nta
    success:function(globalData){
      let sources,newSearch,sortColumn,toggleValue,dataShown=1,fundedYears={},agencies={},bronx={"budget_by_area":[],"yearly_amount":[]}, brooklyn={"budget_by_area":[],"yearly_amount":[]}, manhattan={"budget_by_area":[],"yearly_amount":[]}, statenIsland={"budget_by_area":[],"yearly_amount":[]}, queens={"budget_by_area":[],"yearly_amount":[]}, citywide = {"budget_by_area":[],"yearly_amount":[]};

      //_______________________________________TABULAR DATA SETUP_______________________________________//
      globalData.forEach(function(fund,index){
        //existence of keys not always consistent with every record
        fund.hasOwnProperty("address")?"":globalData[index]["address"]="";
        fund.hasOwnProperty("address_2_optional")?"":globalData[index]["address_2_optional"]="";
        fund.hasOwnProperty("agency")?"":globalData[index]["agency"]="";
        fund.hasOwnProperty("amount")?"":globalData[index]["amount"]="";
        fund.hasOwnProperty("borough")?"":globalData[index]["borough"]="";
        fund.hasOwnProperty("city")?"":globalData[index]["city"]="";
        fund.hasOwnProperty("council_district")?"":globalData[index]["council_district"]="";
        fund.hasOwnProperty("council_member")?"":globalData[index]["council_member"]="";
        fund.hasOwnProperty("fiscal_year")?"":globalData[index]["fiscal_year"]="";
        fund.hasOwnProperty("legal_name_of_organization")?"":globalData[index]["legal_name_of_organization"]="";
        fund.hasOwnProperty("postcode")?"":globalData[index]["postcode"]="";
        fund.hasOwnProperty("purpose_of_funds")?"":globalData[index]["purpose_of_funds"]="";
        fund.hasOwnProperty("program_name")?"":globalData[index]["program_name"]="";
        fund.hasOwnProperty("source")?"":globalData[index]["source"]="";
        fund.hasOwnProperty("state")?"":globalData[index]["state"]="";
        fund.hasOwnProperty("status")?"":globalData[index]["status"]="";

        if(fundedYears.hasOwnProperty(fund["fiscal_year"])){
          fundedYears[fund["fiscal_year"]]["all"].push(fund);
        } else {
          fundedYears[fund["fiscal_year"]] = {"all":[fund],"agencies":{},"agencies_amount":{},"manhattan":0,"brooklyn":0,"bronx":0,"staten island":0,"queens":0,"citywide":0,"manhattan_amount":0,"brooklyn_amount":0,"bronx_amount":0,"staten_island_amount":0,"queens_amount":0,"citywide_amount":0};
        };

        if(fundedYears[fund["fiscal_year"]]["agencies"].hasOwnProperty(fund["agency"].toUpperCase().trim())){
          fundedYears[fund["fiscal_year"]]["agencies"][fund["agency"].toUpperCase().trim()] += 1;
          fundedYears[fund["fiscal_year"]]["agencies_amount"][fund["agency"].toUpperCase().trim()] += parseInt(fund["amount"]);
        } else {
          fundedYears[fund["fiscal_year"]]["agencies"][fund["agency"].toUpperCase().trim()] = 1;
          fundedYears[fund["fiscal_year"]]["agencies_amount"][fund["agency"].toUpperCase().trim()] = parseInt(fund["amount"]);
        };

        switch (fund["borough"].toLowerCase().trim()) {
          case "":
            fundedYears[fund["fiscal_year"]]["citywide_amount"]+=parseInt(fund["amount"])
            fundedYears[fund["fiscal_year"]]["citywide"] += 1 
            break;
          case "staten is":
            fundedYears[fund["fiscal_year"]]["staten_island_amount"]+=parseInt(fund["amount"])
            fundedYears[fund["fiscal_year"]]["staten island"] += 1;
            break;
          case "bronx":
            fundedYears[fund["fiscal_year"]]["bronx_amount"]+=parseInt(fund["amount"])
            fundedYears[fund["fiscal_year"]][fund["borough"].toLowerCase().trim()] += 1;
            break;
          case "brooklyn":
            fundedYears[fund["fiscal_year"]]["brooklyn_amount"]+=parseInt(fund["amount"])
            fundedYears[fund["fiscal_year"]][fund["borough"].toLowerCase().trim()] += 1;
            break;
          case "manhattan":
            fundedYears[fund["fiscal_year"]]["manhattan_amount"]+=parseInt(fund["amount"])
            fundedYears[fund["fiscal_year"]][fund["borough"].toLowerCase().trim()] += 1;
            break;
          case "queens":
            fundedYears[fund["fiscal_year"]]["queens_amount"]+=parseInt(fund["amount"])
            fundedYears[fund["fiscal_year"]][fund["borough"].toLowerCase().trim()] += 1;
            break;
        }
      });

      for (let year in fundedYears){
        bronx["budget_by_area"].push(fundedYears[year].bronx);
        brooklyn["budget_by_area"].push(fundedYears[year].brooklyn);
        manhattan["budget_by_area"].push(fundedYears[year].manhattan);
        statenIsland["budget_by_area"].push(fundedYears[year]["staten island"]);
        queens["budget_by_area"].push(fundedYears[year].queens);
        citywide["budget_by_area"].push(fundedYears[year].citywide);

        bronx["yearly_amount"].push(fundedYears[year]["bronx_amount"]);
        brooklyn["yearly_amount"].push(fundedYears[year]["brooklyn_amount"]);
        manhattan["yearly_amount"].push(fundedYears[year]["manhattan_amount"]);
        statenIsland["yearly_amount"].push(fundedYears[year]["staten_island_amount"]);
        queens["yearly_amount"].push(fundedYears[year]["queens_amount"]);
        citywide["yearly_amount"].push(fundedYears[year]["citywide_amount"]);
      };

      //List.js render of data and creating data attributes for non-table data
      let options={
        valueNames: [
          "amount","council_member","legal_name_of_organization","source",
          {"attr":"data-address","name":"address"},
          {"atrt":"data-address_2_optional","name":"address_2_optional"},
          {"attr":"data-agency","name":"agency"},
          {"attr":"data-borough","name":"borough"},
          {"attr":"data-city","name":"city"},
          {"attr":"data-council_district","name":"council_district"},
          {"attr":"data-fiscal_year", "name": "fiscal_year"},
          {"attr":"data-postcode","name":"postcode"},
          {"attr":"data-purpose_of_funds","name":"purpose_of_funds"},
          {"attr":"data-program_name","name":"program_name"},
          {"attr":"data-state","name":"state"},
          {"attr":"data-status","name":"status"}
        ],
        item:"<tr onClick='fillData($(this))'><td class='trigger address address_2_optional agency bbl bin borough census_tract city community_board council_district ein fiscal_year latitude longitude mocs_id nta postcode purpose_of_funds program_name state status legal_name_of_organization'></td><td class='amount'></td><td class='council_member'></td><td class='source'></td></tr>",
        page:25,
        pagination: [{
          name: "paginationTop",
          paginationClass: "paginationTop",
          innerWindow:1,
          left:2,
          right:2
        }, {
          paginationClass: "paginationBottom",
          innerWindow:1,
          left:2,
          right:2
        }]
      };
      
//_______________________________________DATA VISUALIZATION SETUP_______________________________________//
      let stackedLine,chart = $("#funding-chart"),labels = Object.keys(fundedYears);
      labels.pop();
      labels.push("Unknown");
      let createLineGraphs = function(dataset){
        let data1 = {
          type: "line",
          data:{
            labels: labels,
            datasets:
              [{
                label:"Bronx",
                borderColor: "rgba(47,86,166,0.5)",
                backgroundColor: "rgba(47,86,166,0.1)",
                data: bronx["budget_by_area"]
              },
              {
                label:"Brooklyn",
                borderColor:"rgba(208,93,78,0.5)",
                backgroundColor:"rgba(208,93,78,0.1)",
                data: brooklyn["budget_by_area"]
              },
              {
                label:"Manhattan",
                borderColor:"rgba(34,138,230,0.5)",
                backgroundColor:"rgba(34,138,230,0.1)",
                data: manhattan["budget_by_area"]
              },
              {
                label:"Staten Island",
                borderColor:"rgba(18,184,134,0.5)",
                backgroundColor:"rgba(18,184,134,0.1)",
                data: statenIsland["budget_by_area"]
              },
              {
                label:"Queens",
                borderColor:"rgba(245,159,0,0.5)",
                backgroundColor:"rgba(245,159,0,0.1)",
                data: queens["budget_by_area"]
              },
              {
                label:"Citywide",
                borderColor:"rgba(190,75,219,0.5)",
                backgroundColor:"rgba(190,75,219,0.1)",
                data: citywide["budget_by_area"]
              }]
          },
          options: {
            scales: {
              xAxes:[{
                ticks:{
                  autoSkip:false,
                  fontSize: $(window).width()<=700?8:12
                }
              }],
              yAxes: [{
                ticks:{
                  fontSize: $(window).width()<=700?8:12
                }
              }]
            },
            tooltips:{
              mode: "index",
              intersect: false
            }
          }
        };
        let data2 = {
          type: "line",
          data: {
            labels: labels,
            datasets:
              [{
                label:"Bronx",
                borderColor: "rgba(47,86,166,0.5)",
                backgroundColor: "rgba(47,86,166,0.1)",
                data: bronx["yearly_amount"]
              },
              {
                label:"Brooklyn",
                borderColor:"rgba(208,93,78,0.5)",
                backgroundColor:"rgba(208,93,78,0.1)",
                data: brooklyn["yearly_amount"]
              },
              {
                label:"Manhattan",
                borderColor:"rgba(34,138,230,0.5)",
                backgroundColor:"rgba(34,138,230,0.1)",
                data: manhattan["yearly_amount"]
              },
              {
                label:"Staten Island",
                borderColor:"rgba(18,184,134,0.5)",
                backgroundColor:"rgba(18,184,134,0.1)",
                data: statenIsland["yearly_amount"]
              },
              {
                label:"Queens",
                borderColor:"rgba(245,159,0,0.5)",
                backgroundColor:"rgba(245,159,0,0.1)",
                data: queens["yearly_amount"]
              },
              {
                label:"Citywide",
                borderColor:"rgba(190,75,219,0.5)",
                backgroundColor:"rgba(190,75,219,0.1)",
                data: citywide["yearly_amount"]
              }]
          },
          options: {
            tooltips:{
              mode: "index",
              intersect: false,
              callbacks: {
                label: function(tooltipItems, data,index) {
                  if(parseInt(tooltipItems.yLabel) >= 1000){
                    return data.datasets[tooltipItems.datasetIndex].label +': $' + tooltipItems.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  } else {
                    return data.datasets[tooltipItems.datasetIndex].label +': $' + tooltipItems.yLabel;
                  };
                }
              }
            },
            scales: {
              xAxes:[{
                ticks:{
                  autoSkip:false,
                  fontSize: $(window).width()<=700?8:12
                }
              }],
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                  callback: function(value, index, values) {
                    if(parseInt(value) >= 1000){
                      return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    } else {
                      return '$' + value;
                    };
                  },
                  fontSize: $(window).width()<=700?8:12
                }
              }]
            }
          }
        };
        if (dataset === "data1"){
          stackedLine = new Chart(chart, data1);
        } else if (dataset === "data2"){
          stackedLine = new Chart(chart, data2);
        }
      }

      let updateAgencyYear = function(year,object,criteria){
        let color,backgroundColor,data3,agencies = [];
        switch(parseInt(year)%5){
          case 0:
            borderColor = "rgba(47,86,166,0.9)";
            backgroundColor = "rgba(47,86,166,0.5)";
            break;
          case 1:
            borderColor = "rgba(208,93,78,0.9)";
            backgroundColor = "rgba(208,93,78,0.5)";
            break;
          case 2:
            borderColor = "rgba(190,75,219,0.9)";
            backgroundColor = "rgba(190,75,219,0.5)";
            break;
          case 3:
            borderColor = "rgba(34,138,230,0.9)";
            backgroundColor = "rgba(34,138,230,0.5)";
            break;
          case 4:
            borderColor = "rgba(18,184,134,0.9)";
            backgroundColor = "rgba(18,184,134,0.5)";
            break; 
          default:
            borderColor = "rgba(190,75,219,0.9)";
            backgroundColor = "rgba(190,75,219,0.5)";
            break;
        };
        if (criteria === "number of funds"){
          for (let agency in object[year]["agencies"]){
            agencies.push(object[year]["agencies"][agency]);
          };
          data3 = {
            type:"bar",
            data:{
              labels:Object.keys(object[year]["agencies"]),
              datasets:[
                {
                  label:"Funds given in "+year,
                  borderColor:borderColor,
                  backgroundColor:backgroundColor,
                  data:agencies
                }
              ]
            },
            options: {
              legend:{
                display: false
              },
              scales: {
                xAxes: [{
                  ticks:{
                    autoSkip: false,
                    fontSize: $(window).width()<=700?8:12
                  }
                }],
                yAxes: [{
                  ticks:{
                    fontSize: $(window).width()<=700?8:12
                  }
                }]
              },
              tooltips:{
                mode: "index",
                intersect: false
              }
            }
          };
        } else if (criteria === "amount funded"){
          for (let agency in object[year]["agencies_amount"]){
            agencies.push(object[year]["agencies_amount"][agency]);
          };
          data3 = {
            type:"bar",
            data:{
              labels:Object.keys(object[year]["agencies"]),
              datasets:[
                {
                  label:"Funds given in "+year,
                  borderColor:borderColor,
                  backgroundColor:backgroundColor,
                  data:agencies
                }
              ]
            },
            options: {
              legend:{
                display: false
              },
              tooltips:{
                mode: "index",
                intersect: false,
                callbacks: {
                  label: function(tooltipItems, data,index) {
                    if(parseInt(tooltipItems.yLabel) >= 1000){
                      return '$' + tooltipItems.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    } else {
                      return '$' + tooltipItems.yLabel;
                    };
                  }
                }
              },
              scales: {
                xAxes: [{
                  ticks:{
                    autoSkip: false,
                    fontSize: $(window).width()<=700?8:12
                  }

                }],
                yAxes: [{
                  ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                      if(parseInt(value) >= 1000){
                        return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      } else {
                        return '$' + value;
                      };
                    },
                    fontSize: $(window).width()<=700?8:12,
                  }
                }]
              }
            }
          }
        };
        stackedLine.destroy();
        stackedLine = new Chart(chart, data3);
      }

      function searchResult(searchArray,response) {
        if (searchArray.length === 0){
          alert("You need at least 1 search term");
        } else {
          let htmlSearchTerms,listOfSearch = [];
          for (let i=0; i<searchArray.length; i++){
            listOfSearch[i] = $("#"+searchArray[i]).val().toLowerCase();
          };
          htmlSearchTerms = listOfSearch.join(" ").trim().toUpperCase().split(" ");
          if(htmlSearchTerms.length > 1){
            htmlSearchTerms[htmlSearchTerms.length] = htmlSearchTerms[htmlSearchTerms.length-1];
            htmlSearchTerms[htmlSearchTerms.length-2] = "and";
            htmlSearchTerms = htmlSearchTerms.join(" ");
          }
          newSearch=response.filter(function(budget){
            let matchCriteria = 0;
            for(let j=0; j<searchArray.length; j++){
              if (budget[searchArray[j]].toLowerCase().includes(listOfSearch[j])) matchCriteria+=1;
            };
            if(matchCriteria === searchArray.length) return true;
          });
          userList=new List('budgets',options,newSearch);
          $("#search-results").html("<h3>"+userList.size()+" Results for: "+htmlSearchTerms+"</h3>");
        };
      };

      //Takes data attributes to provide other info
      fillData = function(clickedEl){
        let fullAddress,address,address2,city,state,postcode,$dataCell = $(clickedEl).children().first();
        let org=$(clickedEl).children(".legal_name_of_organization").html().trim();
        let cm=$(clickedEl).children(".council_member").html().trim();
        let cash=$(clickedEl).children(".amount").html().trim();
        //Combine all address related fields into 1 readable address line
        $dataCell.attr("data-address")==null||$dataCell.attr("data-address")==""?address="":address=$dataCell.attr("data-address").trim()+", ";
        $dataCell.attr("data-address_2_optional")==null||$dataCell.attr("data-address_2_optional")==""?address2="":address2=$dataCell.attr("data-address_2_optional").trim()+", ";
        $dataCell.attr("data-city")==null||$dataCell.attr("data-city")==""?city="":city=$dataCell.attr("data-city").trim()+", ";
        $dataCell.attr("data-state")==null||$dataCell.attr("data-state")==""?state="":state=$dataCell.attr("data-state").trim()+" ";
        $dataCell.attr("data-postcode")==null||$dataCell.attr("data-postcode")==""?postcode="":postcode=$dataCell.attr("data-postcode").trim();
        (address+address2+city+state+postcode)===""?fullAddress="<strong>Address:</strong> N/A":fullAddress="<strong>Address:</strong> "+address+address2+city+state+postcode;
        let data="<ul><li><strong>Agency:</strong> "+$dataCell.attr("data-agency")+
        "</li><li><strong>Amount:</strong> $"+cash+
          "</li><li><strong>Borough:</strong> "+$dataCell.attr("data-borough")+
          "</li><li><strong>Council District:</strong> "+$dataCell.attr("data-council_district")+
          "</li><li><strong>Council Member:</strong> "+cm+
          "</li><li><strong>Fiscal Year:</strong> "+$dataCell.attr("data-fiscal_year")+
          "</li><li><strong>Status:</strong> "+$dataCell.attr("data-status")+"</li>";
        // Header data
        $(".iziModal-header-title").html(org);
        $(".iziModal-header-subtitle").html($dataCell.attr("data-program_name"));
        // Body data
        $("#modal .iziModal-content .purpose").html($dataCell.attr("data-purpose_of_funds"))
        $("#modal .iziModal-content .full-address").html(fullAddress);
        $("#modal .iziModal-content .additional-details").html(data);
        $('#modal').iziModal('open');
      };
      $('#search-bar #search-form').submit(function(e){
        e.preventDefault();
        userList.clear();
        let searchValues = [];
        $(".search-fields").each(function(){searchValues.push($(this).attr("id"))});
        searchResult(searchValues,globalData);
        $(".sorting").click(function(e){
          sortColumn=$(this).attr("class").split(" ")[1].split("-")[1];
          let icon=$(this).children().last();
          toggleValue=JSON.parse($(this).attr("data-sort-asc"));
          toggleValue?userList.sort(sortColumn,{order:"desc"}):userList.sort(sortColumn,{order:"asc"});
          $(".fa-sort-desc").removeClass("fa-sort-desc");
          $(".fa-sort-asc").removeClass("fa-sort-asc");
          toggleValue?icon.addClass("fa-sort-desc").removeClass("fa-sort-asc"):icon.addClass("fa-sort-asc").removeClass("fa-sort-desc");
          $(this).attr("data-sort-asc",!toggleValue);
        });
      });
      $("#advanced-options input").on("change",function(){
        if($("#advanced-options input:checked").length !== 0){
          $(this).prop("checked")?$("div#search-field-container").prepend('<input class="search-fields" id="'+$(this).val()+'" type="text" placeholder="'+$(this).val().split("_").join(" ").titleize()+'">'):$("#"+$(this).val()).remove();
        } else {
          alert("You need at least one search term.")
          $(this).prop("checked",true);
        };
      });
      $("#search-menu-button").click(function(){
        $("#search-container").show().animate({"left":"0px"},500);
        resizeSearch();
      });
      $("#close-menu span").click(function(){
        $("#search-container").animate({"left":"-"+$("#search-container").width()+"px"},500);
        setTimeout(function(){$("#search-container").hide()},500);
      });
      $("#change").click(function(e){
        e.preventDefault();
        stackedLine.destroy();
        if (dataShown === 1){
          $(this).html("View Funds to Agencies");
          createLineGraphs("data2");
          dataShown = 2;
          $("#custom-chart-title").html("Amount Received by Organization's Borough(s)")
        } else if (dataShown === 2){
          $(this).html("View Amount Per Agency");
          $("#agency-year-slider").off().val("2009");
          $("#chart-container").prepend('<div class="slide-container"><input type="range" min="2009" max="'+stackedLine.data.labels.slice(-2,-1)+'" value="2009" step="1" id="agency-year-slider" title="Move the slider to view data from other years"></div>');
          updateAgencyYear("2009",fundedYears,"number of funds");
          $(".yearNumber").stop(true,true).html("2009").animate({"opacity":1},325).animate({"opacity":0},325);
          $("#agency-year-slider").on("input", function(e){
            updateAgencyYear($(this).val(),fundedYears,"number of funds");
            $(".yearNumber").stop(true,true).html($(this).val()).animate({"opacity":1},325).animate({"opacity":0},325);
          });
          dataShown = 3;
          $("#custom-chart-title").html("Funds Received by Organization's Agency")
          $("#agency-year-slider").show();
        } else if (dataShown === 3){
          $(this).html("View Funds to Boroughs");
          $("#agency-year-slider").off().val("2009");
          updateAgencyYear("2009",fundedYears,"amount funded");
          $(".yearNumber").stop(true,true).html("2009").animate({"opacity":1},325).animate({"opacity":0},325);
          $("#agency-year-slider").on("input", function(e){
            updateAgencyYear($(this).val(),fundedYears,"amount funded");
            $(".yearNumber").stop(true,true).html($(this).val()).animate({"opacity":1},325).animate({"opacity":0},325);
          });
          dataShown = 4;
          $("#custom-chart-title").html("Amount Received by Organization's Agency")
        } else if (dataShown === 4){
          $(this).html("View Amount Per Borough");
          $(".slide-container").remove();
          createLineGraphs("data1");
          dataShown = 1;
          $("#custom-chart-title").html("Funds Received by Organization's Borough(s)")
        };
      });

      userList = new List('budgets',options,[]);
      createLineGraphs("data1")

      //End of success
      $("body").css({"position":"static","overflow-y":"visible"});
      $("#loader").hide();
      $("#not-loader").css({"visibility":"visible"});
      resizeSearch();
      
      $(window).resize(function() {
        if ($(window).width() <= 700){
          stackedLine.options.scales.xAxes[0].ticks.minor.fontSize = 8;
          stackedLine.options.scales.xAxes[0].ticks.fontSize = 8;
          stackedLine.options.scales.yAxes[0].ticks.minor.fontSize = 8;
          stackedLine.options.scales.yAxes[0].ticks.fontSize = 8;
        } else {
          stackedLine.options.scales.xAxes[0].ticks.minor.fontSize = 12;
          stackedLine.options.scales.xAxes[0].ticks.fontSize = 12;
          stackedLine.options.scales.yAxes[0].ticks.minor.fontSize = 12;
          stackedLine.options.scales.yAxes[0].ticks.fontSize = 12;
        }
        stackedLine.update();
        resizeSearch();
      });
    }
    //End of AJAX GET request
  });
  
  function resizeSearch(){
    let searchHeight;
    if($("body").height() < $(window).height()){
      searchHeight= $(window).height()+"px";
      $("body").css("overflow-y","hidden");
    } else {
      searchHeight = $("body").height()+parseInt($("body").css("margin-top").slice(0,-2))+parseInt($("body").css("margin-bottom").slice(0,-2))+"px";
      $("body").css("overflow-y","visible");
    }
    $("#search-container").css({"left": "-"+$("#search-container").width()+"px","height":searchHeight});
  }
  //Prototyping functions
  Array.prototype.extractSubSet = function(criteria, criteriaValue){
    let subCriteria;
    criteria && criteriaValue ? subCriteria = this.filter(function(fund){return fund[criteria].trim() === criteriaValue}) : subCriteria = this.filter(function(fund){return fund[criteria].trim() === "" || fund[criteria] == null});
    return subCriteria ;
  };
  //titleize words
  String.prototype.titleize = function() {
    let words = this.split(" ");
    let word_count = words.length;
  
    for(let i = 0; i < word_count; i++){
      i === 0?words[i] = words[i].capitalize():"";
    };
    return words.join(" ");
  };
  String.prototype.capitalize = function() {
    let word = this;
    if (word[0] && word.toUpperCase){
      return word[0].toUpperCase() + word.slice(1);
    };
  };
  //leaving mobile detection jQuery just in case
  if (/Mobi/.test(navigator.userAgent)) {
  }
//End document ready
});
