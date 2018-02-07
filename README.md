# NYC Council Discretionary Funding Data Visualization and Search
This static HTML page makes a **GET** request to New York City's [Open Data API](https://opendata.cityofnewyork.us/) for [Discretionary Funding](https://data.cityofnewyork.us/City-Government/New-York-City-Council-Discretionary-Funding/4d7f-74pe) from the [New York City Council](https://council.nyc.gov/).

Features currently include:
* View a number of different datasets in chart form
* Clicking top legend in first 2 charts temporarily removes that dataset from view
* Last 2 charts have a slider that changes the year of the dataset
* Search entire database by a number of criteria
* Toggle criteria to search by checking and unchecking boxes
* Restrict users from searching blank fields or unchecking all boxes
* Sort results by ascending or descending value in: Organization's Name, $ Amount, Council Member, or Source
* Clicking an organization's name in the results will open a small window with additional information on that fund
* Browser responsiver
* Mobile friendly (sort of)

Currently there are 4 interchangeable chart or data visualizations:
* Number of funds given to organizations categorized by boroughs from 2009 to the present (at this time 2018)
* Amount of money given to organizations categorized by boroughs from 2009 to the present (at this time 2018)
* Number of funds given to agencies from 2009 to the present (at this time 2018)
* Amount of money given to agencies from 2009 to the present (at this time 2018)

The following libraries/plug-ins/frameworks/etc. were utilized:
* [jQuery v3.2.1](https://jquery.com/)
* [Font Awesome 5](https://fontawesome.com/)
* [iziModal.js v.1.6.0](http://izimodal.marcelodolce.com/)
* [List.js v1.5.0](http://listjs.com/)
* [Chart.js v2.7.1](http://www.chartjs.org/)
