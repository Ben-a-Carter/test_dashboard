/* =========================================================
   GLOBAL DATA
   ========================================================= */

let originalData = [];

let filteredData = [];


/*
  Students selected using the Plotly
  scatterplot lasso / box selection.
*/

let selectedStudentIds =
  new Set();


/* =========================================================
   DASHBOARD STATE
   ========================================================= */

const dashboardState = {

  year:
    "all",

  term:
    "all",

  department:
    "all",

  program:
    "all",

  studentType:
    "all",

  risk:
    "all"

};


/* =========================================================
   COLORS
   ========================================================= */

const colors = {

  navy:
    "#1f3864",

  blue:
    "#2e75b6",

  green:
    "#548235",

  orange:
    "#d98c31",

  red:
    "#c94c4c",

  purple:
    "#7665a8",

  gray:
    "#73726c"

};


/* =========================================================
   PLOTLY CONFIGURATION
   ========================================================= */

const plotConfig = {

  responsive:
    true,

  displaylogo:
    false,

  modeBarButtonsToRemove: [
    "sendDataToCloud"
  ]

};


/* =========================================================
   LOAD CSV
   ========================================================= */

console.log(
  "Loading student dashboard..."
);


Papa.parse(
  "./data/students.csv",

  {

    download:
      true,

    header:
      true,

    dynamicTyping:
      true,

    skipEmptyLines:
      true,


    complete:
      function(results) {

        console.log(
          "CSV rows:",
          results.data.length
        );


        if (
          results.errors.length > 0
        ) {

          console.warn(
            "CSV parsing warnings:",
            results.errors
          );

        }


        originalData =
          results.data.filter(
            row =>
              row.student_id
          );


        console.log(
          "Usable students:",
          originalData.length
        );


        initializeDashboard();

      },


    error:
      function(error) {

        console.error(
          "Unable to load students.csv",
          error
        );

      }

  }
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeDashboard() {

  populateFilters();

  connectFilterEvents();

  connectButtons();

  updateDashboard();

}


/* =========================================================
   FILTER POPULATION
   ========================================================= */

function populateFilters() {

  populateSelect(
    "yearFilter",
    uniqueValues(
      originalData,
      "year"
    )
  );


  populateSelect(
    "termFilter",
    uniqueValues(
      originalData,
      "term"
    )
  );


  populateSelect(
    "departmentFilter",
    uniqueValues(
      originalData,
      "department"
    )
  );


  populateSelect(
    "programFilter",
    uniqueValues(
      originalData,
      "program"
    )
  );


  populateSelect(
    "studentTypeFilter",
    uniqueValues(
      originalData,
      "student_type"
    )
  );


  populateSelect(
    "riskFilter",
    [
      "Low",
      "Medium",
      "High"
    ]
  );

}


/* =========================================================
   GENERIC SELECT POPULATOR
   ========================================================= */

function populateSelect(
  elementId,
  values
) {

  const select =
    document.getElementById(
      elementId
    );


  values.forEach(
    value => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        value;


      option.textContent =
        value;


      select.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   UNIQUE VALUES
   ========================================================= */

function uniqueValues(
  data,
  field
) {

  return [
    ...new Set(

      data
        .map(
          row =>
            row[field]
        )

        .filter(
          value =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )

    )
  ]
    .sort(
      (a,b) => {

        if (
          typeof a === "number" &&
          typeof b === "number"
        ) {

          return a - b;

        }


        return String(a)
          .localeCompare(
            String(b)
          );

      }
    );

}


/* =========================================================
   FILTER EVENTS
   ========================================================= */

function connectFilterEvents() {

  document
    .getElementById(
      "yearFilter"
    )
    .addEventListener(
      "change",
      event => {

        dashboardState.year =
          event.target.value;

        clearStudentSelection();

        updateDashboard();

      }
    );


  document
    .getElementById(
      "termFilter"
    )
    .addEventListener(
      "change",
      event => {

        dashboardState.term =
          event.target.value;

        clearStudentSelection();

        updateDashboard();

      }
    );


  document
    .getElementById(
      "departmentFilter"
    )
    .addEventListener(
      "change",
      event => {

        dashboardState.department =
          event.target.value;

        clearStudentSelection();

        updateDashboard();

      }
    );


  document
    .getElementById(
      "programFilter"
    )
    .addEventListener(
      "change",
      event => {

        dashboardState.program =
          event.target.value;

        clearStudentSelection();

        updateDashboard();

      }
    );


  document
    .getElementById(
      "studentTypeFilter"
    )
    .addEventListener(
      "change",
      event => {

        dashboardState.studentType =
          event.target.value;

        clearStudentSelection();

        updateDashboard();

      }
    );


  document
    .getElementById(
      "riskFilter"
    )
    .addEventListener(
      "change",
      event => {

        dashboardState.risk =
          event.target.value;

        clearStudentSelection();

        updateDashboard();

      }
    );

}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

function connectButtons() {

  document
    .getElementById(
      "resetFilters"
    )
    .addEventListener(
      "click",
      resetFilters
    );


  document
    .getElementById(
      "clearSelection"
    )
    .addEventListener(
      "click",
      function() {

        clearStudentSelection();

        updateDashboard();

      }
    );

}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function resetFilters() {

  dashboardState.year =
    "all";

  dashboardState.term =
    "all";

  dashboardState.department =
    "all";

  dashboardState.program =
    "all";

  dashboardState.studentType =
    "all";

  dashboardState.risk =
    "all";


  selectedStudentIds.clear();


  document
    .getElementById(
      "yearFilter"
    )
    .value =
      "all";


  document
    .getElementById(
      "termFilter"
    )
    .value =
      "all";


  document
    .getElementById(
      "departmentFilter"
    )
    .value =
      "all";


  document
    .getElementById(
      "programFilter"
    )
    .value =
      "all";


  document
    .getElementById(
      "studentTypeFilter"
    )
    .value =
      "all";


  document
    .getElementById(
      "riskFilter"
    )
    .value =
      "all";


  updateDashboard();

}


/* =========================================================
   CLEAR STUDENT SELECTION
   ========================================================= */

function clearStudentSelection() {

  selectedStudentIds.clear();

}


/* =========================================================
   FILTER DATA
   ========================================================= */

function getFilteredData() {

  let data =
    originalData.filter(
      row => {

        const yearMatch =
          dashboardState.year ===
            "all" ||

          String(row.year) ===
            String(
              dashboardState.year
            );


        const termMatch =
          dashboardState.term ===
            "all" ||

          row.term ===
            dashboardState.term;


        const departmentMatch =
          dashboardState.department ===
            "all" ||

          row.department ===
            dashboardState.department;


        const programMatch =
          dashboardState.program ===
            "all" ||

          row.program ===
            dashboardState.program;


        const studentTypeMatch =
          dashboardState.studentType ===
            "all" ||

          row.student_type ===
            dashboardState.studentType;


        const riskMatch =
          dashboardState.risk ===
            "all" ||

          row.risk_level ===
            dashboardState.risk;


        return (

          yearMatch &&
          termMatch &&
          departmentMatch &&
          programMatch &&
          studentTypeMatch &&
          riskMatch

        );

      }
    );


  /*
    If users selected points from
    the scatterplot, restrict the
    entire dashboard to those students.
  */

  if (
    selectedStudentIds.size > 0
  ) {

    data =
      data.filter(
        row =>
          selectedStudentIds.has(
            row.student_id
          )
      );

  }


  return data;

}


/* =========================================================
   MAIN UPDATE FUNCTION
   ========================================================= */

function updateDashboard() {

  filteredData =
    getFilteredData();


  updateActiveFilters();

  updateMetrics();

  updateTrendChart();

  updateDepartmentChart();

  updateRiskChart();

  updateScatterChart();

  updateHeatmapChart();

  updateBoxChart();

  updateSankeyChart();

  updateStudentTable();

}


/* =========================================================
   ACTIVE FILTERS
   ========================================================= */

function updateActiveFilters() {

  const container =
    document.getElementById(
      "activeFilters"
    );


  container.innerHTML =
    "";


  const filters = [

    [
      "Year",
      dashboardState.year
    ],

    [
      "Term",
      dashboardState.term
    ],

    [
      "Department",
      dashboardState.department
    ],

    [
      "Program",
      dashboardState.program
    ],

    [
      "Student type",
      dashboardState.studentType
    ],

    [
      "Risk",
      dashboardState.risk
    ]

  ];


  let activeCount = 0;


  filters.forEach(
    ([label,value]) => {

      if (
        value !== "all"
      ) {

        activeCount += 1;


        const chip =
          document.createElement(
            "span"
          );


        chip.className =
          "filter-chip";


        chip.textContent =
          `${label}: ${value}`;


        container.appendChild(
          chip
        );

      }

    }
  );


  if (
    selectedStudentIds.size > 0
  ) {

    activeCount += 1;


    const chip =
      document.createElement(
        "span"
      );


    chip.className =
      "filter-chip";


    chip.textContent =
      `${selectedStudentIds.size.toLocaleString()} selected students`;


    container.appendChild(
      chip
    );

  }


  if (
    activeCount === 0
  ) {

    const text =
      document.createElement(
        "span"
      );


    text.className =
      "no-filter";


    text.textContent =
      "No filters applied";


    container.appendChild(
      text
    );

  }


  document
    .getElementById(
      "clearSelection"
    )
    .disabled =
      selectedStudentIds.size === 0;

}


/* =========================================================
   KPI METRICS
   ========================================================= */

function updateMetrics() {

  const count =
    filteredData.length;


  const retained =
    filteredData.filter(
      row =>
        row.retained ===
        "Yes"
    ).length;


  const graduated =
    filteredData.filter(
      row =>
        row.graduated ===
        "Yes"
    ).length;


  const highRisk =
    filteredData.filter(
      row =>
        row.risk_level ===
        "High"
    ).length;


  const avgGPA =
    count > 0

      ? filteredData.reduce(
          (sum,row) =>
            sum +
            Number(row.gpa),
          0
        ) /
        count

      : 0;


  const retentionRate =
    count > 0

      ? retained /
        count *
        100

      : 0;


  const graduationRate =
    count > 0

      ? graduated /
        count *
        100

      : 0;


  const highRiskRate =
    count > 0

      ? highRisk /
        count *
        100

      : 0;


  document
    .getElementById(
      "studentCount"
    )
    .textContent =
      count.toLocaleString();


  document
    .getElementById(
      "retentionRate"
    )
    .textContent =
      `${retentionRate.toFixed(1)}%`;


  document
    .getElementById(
      "graduationRate"
    )
    .textContent =
      `${graduationRate.toFixed(1)}%`;


  document
    .getElementById(
      "averageGPA"
    )
    .textContent =
      avgGPA.toFixed(2);


  document
    .getElementById(
      "highRiskRate"
    )
    .textContent =
      `${highRiskRate.toFixed(1)}%`;

}


/* =========================================================
   TREND CHART
   ========================================================= */

function updateTrendChart() {

  const years =
    uniqueValues(
      filteredData,
      "year"
    );


  const counts = [];

  const retentionRates = [];


  years.forEach(
    year => {

      const subset =
        filteredData.filter(
          row =>
            row.year === year
        );


      counts.push(
        subset.length
      );


      const retained =
        subset.filter(
          row =>
            row.retained ===
            "Yes"
        ).length;


      retentionRates.push(

        subset.length > 0

          ? retained /
            subset.length *
            100

          : 0

      );

    }
  );


  const traces = [

    {

      x:
        years,

      y:
        counts,

      type:
        "bar",

      name:
        "Students",

      marker: {
        color:
          colors.blue
      },

      hovertemplate:
        "Year %{x}" +
        "<br>Students: %{y:,}" +
        "<extra></extra>"

    },


    {

      x:
        years,

      y:
        retentionRates,

      type:
        "scatter",

      mode:
        "lines+markers",

      name:
        "Retention",

      yaxis:
        "y2",

      line: {
        color:
          colors.green,

        width:
          3
      },

      marker: {
        size:
          8
      },

      hovertemplate:
        "Year %{x}" +
        "<br>Retention: %{y:.1f}%" +
        "<extra></extra>"

    }

  ];


  const layout = {

    margin: {
      t: 15,
      r: 60,
      b: 55,
      l: 60
    },

    xaxis: {
      title:
        "Academic year"
    },

    yaxis: {
      title:
        "Students",

      rangemode:
        "tozero"
    },

    yaxis2: {

      title:
        "Retention rate",

      overlaying:
        "y",

      side:
        "right",

      ticksuffix:
        "%",

      range:
        [0,100]

    },

    legend: {

      orientation:
        "h",

      y:
        1.12

    },

    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)"

  };


  Plotly.react(
    "trendChart",
    traces,
    layout,
    plotConfig
  );

}


/* =========================================================
   DEPARTMENT STACKED BAR
   ========================================================= */

function updateDepartmentChart() {

  const departments =
    uniqueValues(
      filteredData,
      "department"
    );


  const types =
    uniqueValues(
      filteredData,
      "student_type"
    );


  const traces =
    types.map(
      (
        studentType,
        index
      ) => {

        const palette = [
          colors.blue,
          colors.navy,
          colors.purple
        ];


        return {

          x:
            departments,

          y:
            departments.map(
              department =>

                filteredData
                  .filter(
                    row =>
                      row.department ===
                        department &&

                      row.student_type ===
                        studentType
                  )
                  .length

            ),

          type:
            "bar",

          name:
            studentType,

          marker: {
            color:
              palette[
                index %
                palette.length
              ]
          },

          customdata:
            departments,

          hovertemplate:
            "%{x}" +
            `<br>${studentType}: %{y:,}` +
            "<extra></extra>"

        };

      }
    );


  const layout = {

    barmode:
      "stack",

    margin: {
      t: 15,
      r: 15,
      b: 95,
      l: 55
    },

    xaxis: {
      tickangle:
        -25
    },

    yaxis: {
      title:
        "Students"
    },

    legend: {
      orientation:
        "h",

      y:
        1.13
    },

    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)"

  };


  Plotly.react(
    "departmentChart",
    traces,
    layout,
    plotConfig
  )
  .then(
    attachDepartmentInteraction
  );

}


/* =========================================================
   DEPARTMENT CLICK
   ========================================================= */

function attachDepartmentInteraction() {

  const plot =
    document.getElementById(
      "departmentChart"
    );


  if (
    plot.removeAllListeners
  ) {

    plot.removeAllListeners(
      "plotly_click"
    );

  }


  plot.on(
    "plotly_click",
    eventData => {

      if (
        !eventData.points ||
        eventData.points.length === 0
      ) {

        return;

      }


      const department =
        eventData
          .points[0]
          .x;


      dashboardState.department =
        department;


      document
        .getElementById(
          "departmentFilter"
        )
        .value =
          department;


      clearStudentSelection();

      updateDashboard();

    }
  );

}


/* =========================================================
   RISK DONUT
   ========================================================= */

function updateRiskChart() {

  const levels = [
    "Low",
    "Medium",
    "High"
  ];


  const values =
    levels.map(
      level =>

        filteredData.filter(
          row =>
            row.risk_level ===
            level
        ).length

    );


  const trace = {

    labels:
      levels,

    values:
      values,

    type:
      "pie",

    hole:
      .58,

    marker: {

      colors: [
        colors.green,
        colors.orange,
        colors.red
      ]

    },

    textinfo:
      "percent",

    hovertemplate:
      "%{label}" +
      "<br>Students: %{value:,}" +
      "<br>%{percent}" +
      "<extra></extra>"

  };


  const layout = {

    margin: {
      t: 20,
      r: 20,
      b: 30,
      l: 20
    },

    showlegend:
      true,

    legend: {
      orientation:
        "h",

      y:
        -.1
    },

    paper_bgcolor:
      "rgba(0,0,0,0)"

  };


  Plotly.react(
    "riskChart",
    [trace],
    layout,
    plotConfig
  )
  .then(
    attachRiskInteraction
  );

}


/* =========================================================
   RISK CLICK
   ========================================================= */

function attachRiskInteraction() {

  const plot =
    document.getElementById(
      "riskChart"
    );


  if (
    plot.removeAllListeners
  ) {

    plot.removeAllListeners(
      "plotly_click"
    );

  }


  plot.on(
    "plotly_click",
    eventData => {

      const label =
        eventData
          .points?.[0]
          ?.label;


      if (!label) {

        return;

      }


      dashboardState.risk =
        label;


      document
        .getElementById(
          "riskFilter"
        )
        .value =
          label;


      clearStudentSelection();

      updateDashboard();

    }
  );

}


/* =========================================================
   GPA / ATTENDANCE SCATTER
   ========================================================= */

function updateScatterChart() {

  const low = [];
  const medium = [];
  const high = [];


  filteredData.forEach(
    row => {

      const point = {

        x:
          Number(
            row.attendance_rate
          ),

        y:
          Number(
            row.gpa
          ),

        studentId:
          row.student_id,

        department:
          row.department,

        program:
          row.program,

        visits:
          Number(
            row.advising_visits
          ),

        engagement:
          Number(
            row.engagement_score
          ),

        credits:
          Number(
            row.credits_completed
          )

      };


      if (
        row.risk_level ===
        "High"
      ) {

        high.push(
          point
        );

      }

      else if (
        row.risk_level ===
        "Medium"
      ) {

        medium.push(
          point
        );

      }

      else {

        low.push(
          point
        );

      }

    }
  );


  const makeTrace =
    (
      points,
      label,
      color
    ) => ({

      x:
        points.map(
          p => p.x
        ),

      y:
        points.map(
          p => p.y
        ),

      customdata:
        points.map(
          p => [

            p.studentId,
            p.department,
            p.program,
            p.visits,
            p.engagement,
            p.credits

          ]
        ),

      mode:
        "markers",

      type:
        "scattergl",

      name:
        label,

      marker: {

        size:
          points.map(
            p =>
              6 +
              p.visits *
              1.5
          ),

        color:
          color,

        opacity:
          .62

      },

      hovertemplate:

        "<b>%{customdata[0]}</b>" +

        "<br>%{customdata[1]}" +

        "<br>%{customdata[2]}" +

        "<br>Attendance: %{x:.1f}%" +

        "<br>GPA: %{y:.2f}" +

        "<br>Advising visits: %{customdata[3]}" +

        "<br>Engagement: %{customdata[4]:.1f}" +

        "<br>Credits completed: %{customdata[5]}" +

        "<extra></extra>"

    });


  const traces = [

    makeTrace(
      low,
      "Low risk",
      colors.green
    ),

    makeTrace(
      medium,
      "Medium risk",
      colors.orange
    ),

    makeTrace(
      high,
      "High risk",
      colors.red
    )

  ];


  const layout = {

    dragmode:
      "lasso",

    margin: {
      t: 15,
      r: 30,
      b: 60,
      l: 60
    },

    xaxis: {

      title:
        "Attendance rate",

      ticksuffix:
        "%",

      range:
        [40,101]

    },

    yaxis: {

      title:
        "GPA",

      range:
        [0.75,4.05]

    },

    legend: {

      orientation:
        "h",

      y:
        1.12

    },

    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)"

  };


  Plotly.react(
    "scatterChart",
    traces,
    layout,
    plotConfig
  )
  .then(
    attachScatterInteraction
  );

}


/* =========================================================
   LASSO / BOX SELECTION
   ========================================================= */

function attachScatterInteraction() {

  const plot =
    document.getElementById(
      "scatterChart"
    );


  if (
    plot.removeAllListeners
  ) {

    plot.removeAllListeners(
      "plotly_selected"
    );

  }


  plot.on(
    "plotly_selected",
    eventData => {

      if (
        !eventData ||
        !eventData.points ||
        eventData.points.length === 0
      ) {

        return;

      }


      const ids =
        eventData.points

          .map(
            point =>
              point.customdata?.[0]
          )

          .filter(
            Boolean
          );


      selectedStudentIds =
        new Set(
          ids
        );


      /*
        We intentionally do not redraw
        the scatterplot immediately.

        Doing so would erase the visible
        selection box.

        We instead update the KPIs,
        active filters, and table.
      */

      filteredData =
        getFilteredData();


      updateActiveFilters();

      updateMetrics();

      updateStudentTable();

    }
  );

}


/* =========================================================
   RETENTION HEATMAP
   ========================================================= */

function updateHeatmapChart() {

  const departments =
    uniqueValues(
      filteredData,
      "department"
    );


  const years =
    uniqueValues(
      filteredData,
      "year"
    );


  const z =
    departments.map(
      department =>

        years.map(
          year => {

            const subset =
              filteredData.filter(
                row =>

                  row.department ===
                    department &&

                  row.year ===
                    year
              );


            if (
              subset.length === 0
            ) {

              return null;

            }


            const retained =
              subset.filter(
                row =>
                  row.retained ===
                  "Yes"
              ).length;


            return (

              retained /
              subset.length *
              100

            );

          }
        )

    );


  const trace = {

    type:
      "heatmap",

    x:
      years,

    y:
      departments,

    z:
      z,

    zmin:
      40,

    zmax:
      100,

    colorscale: [

      [
        0,
        "#d98686"
      ],

      [
        .5,
        "#efcf8c"
      ],

      [
        1,
        "#8abb7c"
      ]

    ],

    colorbar: {

      title:
        "Retention %"

    },

    hovertemplate:

      "<b>%{y}</b>" +

      "<br>Year: %{x}" +

      "<br>Retention: %{z:.1f}%" +

      "<extra></extra>"

  };


  const layout = {

    margin: {
      t: 20,
      r: 90,
      b: 55,
      l: 150
    },

    xaxis: {
      title:
        "Academic year"
    },

    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)"

  };


  Plotly.react(
    "heatmapChart",
    [trace],
    layout,
    plotConfig
  )
  .then(
    attachHeatmapInteraction
  );

}


/* =========================================================
   HEATMAP CLICK
   ========================================================= */

function attachHeatmapInteraction() {

  const plot =
    document.getElementById(
      "heatmapChart"
    );


  if (
    plot.removeAllListeners
  ) {

    plot.removeAllListeners(
      "plotly_click"
    );

  }


  plot.on(
    "plotly_click",
    eventData => {

      const point =
        eventData
          .points?.[0];


      if (!point) {

        return;

      }


      dashboardState.year =
        String(
          point.x
        );


      dashboardState.department =
        point.y;


      document
        .getElementById(
          "yearFilter"
        )
        .value =
          String(
            point.x
          );


      document
        .getElementById(
          "departmentFilter"
        )
        .value =
          point.y;


      clearStudentSelection();

      updateDashboard();

    }
  );

}


/* =========================================================
   GPA BOX PLOT
   ========================================================= */

function updateBoxChart() {

  const departments =
    uniqueValues(
      filteredData,
      "department"
    );


  const traces =
    departments.map(
      (
        department,
        index
      ) => {

        const subset =
          filteredData.filter(
            row =>
              row.department ===
              department
          );


        return {

          y:
            subset.map(
              row =>
                Number(
                  row.gpa
                )
            ),

          type:
            "box",

          name:
            department,

          boxpoints:
            "outliers",

          jitter:
            .3,

          pointpos:
            0,

          marker: {

            color:
              [
                colors.blue,
                colors.green,
                colors.orange,
                colors.purple,
                colors.navy
              ][
                index % 5
              ]

          },

          hovertemplate:
            "GPA %{y:.2f}" +
            "<extra>" +
            department +
            "</extra>"

        };

      }
    );


  const layout = {

    margin: {
      t: 20,
      r: 20,
      b: 100,
      l: 55
    },

    yaxis: {

      title:
        "GPA",

      range:
        [.75,4.05]

    },

    xaxis: {
      tickangle:
        -25
    },

    showlegend:
      false,

    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)"

  };


  Plotly.react(
    "boxChart",
    traces,
    layout,
    plotConfig
  );

}


/* =========================================================
   SANKEY OUTCOMES
   ========================================================= */

function updateSankeyChart() {

  const riskLevels = [
    "Low",
    "Medium",
    "High"
  ];


  /*
    Nodes:

    0 Low
    1 Medium
    2 High

    3 Retained
    4 Not retained

    5 Graduated
    6 Not graduated
  */


  const labels = [

    "Low risk",
    "Medium risk",
    "High risk",

    "Retained",
    "Not retained",

    "Graduated",
    "Not graduated"

  ];


  const sources = [];
  const targets = [];
  const values = [];


  riskLevels.forEach(
    (
      risk,
      index
    ) => {

      const subset =
        filteredData.filter(
          row =>
            row.risk_level ===
            risk
        );


      const retained =
        subset.filter(
          row =>
            row.retained ===
            "Yes"
        ).length;


      const notRetained =
        subset.length -
        retained;


      sources.push(
        index
      );

      targets.push(
        3
      );

      values.push(
        retained
      );


      sources.push(
        index
      );

      targets.push(
        4
      );

      values.push(
        notRetained
      );

    }
  );


  const retainedStudents =
    filteredData.filter(
      row =>
        row.retained ===
        "Yes"
    );


  const retainedGraduated =
    retainedStudents.filter(
      row =>
        row.graduated ===
        "Yes"
    ).length;


  const retainedNotGraduated =
    retainedStudents.length -
    retainedGraduated;


  const nonRetainedStudents =
    filteredData.filter(
      row =>
        row.retained !==
        "Yes"
    );


  const nonRetainedGraduated =
    nonRetainedStudents.filter(
      row =>
        row.graduated ===
        "Yes"
    ).length;


  const nonRetainedNotGraduated =
    nonRetainedStudents.length -
    nonRetainedGraduated;


  sources.push(
    3,
    3,
    4,
    4
  );


  targets.push(
    5,
    6,
    5,
    6
  );


  values.push(

    retainedGraduated,

    retainedNotGraduated,

    nonRetainedGraduated,

    nonRetainedNotGraduated

  );


  const trace = {

    type:
      "sankey",

    orientation:
      "h",

    node: {

      pad:
        18,

      thickness:
        18,

      label:
        labels,

      color: [

        colors.green,
        colors.orange,
        colors.red,

        colors.blue,
        colors.gray,

        colors.navy,
        "#a5a5a5"

      ]

    },

    link: {

      source:
        sources,

      target:
        targets,

      value:
        values

    }

  };


  const layout = {

    margin: {
      t: 20,
      r: 20,
      b: 20,
      l: 20
    },

    paper_bgcolor:
      "rgba(0,0,0,0)",

    font: {
      size:
        12
    }

  };


  Plotly.react(
    "sankeyChart",
    [trace],
    layout,
    plotConfig
  );

}


/* =========================================================
   STUDENT TABLE
   ========================================================= */

function updateStudentTable() {

  const tbody =
    document.querySelector(
      "#studentTable tbody"
    );


  tbody.innerHTML =
    "";


  const rows =
    filteredData.slice(
      0,
      100
    );


  rows.forEach(
    row => {

      const tr =
        document.createElement(
          "tr"
        );


      tr.innerHTML = `

        <td>
          ${row.student_id}
        </td>

        <td>
          ${row.year}
        </td>

        <td>
          ${row.term}
        </td>

        <td>
          ${row.department}
        </td>

        <td>
          ${row.program}
        </td>

        <td>
          ${row.student_type}
        </td>

        <td>
          ${Number(row.gpa).toFixed(2)}
        </td>

        <td>
          ${Number(row.attendance_rate).toFixed(1)}%
        </td>

        <td>
          ${Number(row.engagement_score).toFixed(1)}
        </td>

        <td>
          ${row.credits_completed}
        </td>

        <td
          class="
            risk-${String(
              row.risk_level
            ).toLowerCase()}
          "
        >
          ${row.risk_level}
        </td>

        <td>
          ${row.retained}
        </td>

        <td>
          ${row.graduated}
        </td>

      `;


      tbody.appendChild(
        tr
      );

    }
  );


  document
    .getElementById(
      "tableCount"
    )
    .textContent =

      `${rows.length.toLocaleString()}` +

      ` of ` +

      `${filteredData.length.toLocaleString()}`;

}
