/* =========================================================
   GLOBAL DATA
   ========================================================= */

let originalData = [];

let filteredData = [];


/* =========================================================
   DROPDOWN FILTERS
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
   PLOT FILTERS
   ========================================================= */

const plotFilters = {

  trend:
    {},

  department:
    {},

  risk:
    {},

  scatter:
    {},

  heatmap:
    {},

  box:
    {},

  sankey:
    {}

};


/* =========================================================
   HOVER STATE
   ========================================================= */

const hoverState = {

  filters:
    {},

  message:
    null

};


/* =========================================================
   TABLE STATE
   ========================================================= */

const tableState = {

  sortField:
    "student_id",

  sortDirection:
    "asc"

};


/* =========================================================
   THEME STATE
   ========================================================= */

const themeState = {

  mode:
    localStorage.getItem(
      "dashboard-theme"
    ) ||
    "system"

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
   PLOT CONFIG
   ========================================================= */

const plotConfig = {

  responsive:
    true,

  displaylogo:
    false

};


/* =========================================================
   TABLE COLUMNS
   ========================================================= */

const columns = [

  ["student_id", "Student"],

  ["year", "Year"],

  ["term", "Term"],

  ["department", "Department"],

  ["program", "Program"],

  [
    "student_type",
    "Student type"
  ],

  ["gender", "Gender"],

  [
    "race_ethnicity",
    "Race / ethnicity"
  ],

  ["age", "Age"],

  [
    "residency_status",
    "Residency"
  ],

  [
    "first_generation",
    "First generation"
  ],

  [
    "financial_aid",
    "Financial aid"
  ],

  [
    "unmet_financial_need",
    "Unmet need"
  ],

  [
    "credits_attempted",
    "Credits attempted"
  ],

  [
    "credits_completed",
    "Credits completed"
  ],

  [
    "completion_rate",
    "Completion rate"
  ],

  [
    "attendance_rate",
    "Attendance"
  ],

  [
    "engagement_score",
    "Engagement"
  ],

  [
    "advising_visits",
    "Advising visits"
  ],

  [
    "tutoring_visits",
    "Tutoring visits"
  ],

  [
    "online_courses",
    "Online courses"
  ],

  ["gpa", "GPA"],

  ["risk_level", "Risk"],

  [
    "retention_probability",
    "Retention probability"
  ],

  ["retained", "Retained"],

  [
    "graduation_probability",
    "Graduation probability"
  ],

  ["graduated", "Graduated"]

];


const numericFields =
  new Set([

    "year",

    "age",

    "unmet_financial_need",

    "credits_attempted",

    "credits_completed",

    "completion_rate",

    "attendance_rate",

    "engagement_score",

    "advising_visits",

    "tutoring_visits",

    "online_courses",

    "gpa",

    "retention_probability",

    "graduation_probability"

  ]);


/* =========================================================
   LOAD DATA
   ========================================================= */

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

        originalData =
          results.data.filter(
            row =>
              row.student_id
          );


        console.log(
          "Loaded students:",
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

  initializeTheme();

  populateFilters();

  buildTableHeader();

  connectFilterEvents();

  connectResetButtons();

  updateDashboard();

}


/* =========================================================
   THEME
   ========================================================= */

function initializeTheme() {

  const selector =
    document.getElementById(
      "themeSelect"
    );


  selector.value =
    themeState.mode;


  selector.addEventListener(

    "change",

    event => {

      themeState.mode =
        event.target.value;


      localStorage.setItem(
        "dashboard-theme",
        themeState.mode
      );


      applyTheme();

    }

  );


  const systemTheme =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );


  systemTheme.addEventListener(

    "change",

    () => {

      if (
        themeState.mode ===
        "system"
      ) {

        applyTheme();

      }

    }

  );


  applyTheme();

}


function getResolvedTheme() {

  if (
    themeState.mode ===
    "light"
  ) {

    return "light";

  }


  if (
    themeState.mode ===
    "dark"
  ) {

    return "dark";

  }


  return window
    .matchMedia(
      "(prefers-color-scheme: dark)"
    )
    .matches

      ? "dark"

      : "light";

}


function applyTheme() {

  const theme =
    getResolvedTheme();


  document
    .documentElement
    .setAttribute(
      "data-theme",
      theme
    );


  if (
    originalData.length > 0
  ) {

    updateDashboard();

  }

}


/* =========================================================
   PLOT THEME
   ========================================================= */

function getPlotTheme() {

  const dark =
    getResolvedTheme() ===
    "dark";


  return {

    background:

      dark
        ? "#1a1e24"
        : "#ffffff",

    text:

      dark
        ? "#edf1f5"
        : "#3d3d3a",

    muted:

      dark
        ? "#aab4bf"
        : "#73726c",

    grid:

      dark
        ? "#30363d"
        : "#e2e0db",

    zero:

      dark
        ? "#414851"
        : "#cac7c1"

  };

}


function themedLayout(
  layout = {}
) {

  const theme =
    getPlotTheme();


  const existingXAxis =
    layout.xaxis ||
    {};


  const existingYAxis =
    layout.yaxis ||
    {};


  return {

    ...layout,


    paper_bgcolor:
      theme.background,


    plot_bgcolor:
      theme.background,


    font: {

      color:
        theme.text,

      ...layout.font

    },


    xaxis: {

      gridcolor:
        theme.grid,

      zerolinecolor:
        theme.zero,

      tickfont: {
        color:
          theme.text
      },

      titlefont: {
        color:
          theme.text
      },

      ...existingXAxis

    },


    yaxis: {

      gridcolor:
        theme.grid,

      zerolinecolor:
        theme.zero,

      tickfont: {
        color:
          theme.text
      },

      titlefont: {
        color:
          theme.text
      },

      ...existingYAxis

    }

  };

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
      (
        a,
        b
      ) => {

        if (
          typeof a ===
            "number" &&

          typeof b ===
            "number"
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

  const bindings = [

    [
      "yearFilter",
      "year"
    ],

    [
      "termFilter",
      "term"
    ],

    [
      "departmentFilter",
      "department"
    ],

    [
      "programFilter",
      "program"
    ],

    [
      "studentTypeFilter",
      "studentType"
    ],

    [
      "riskFilter",
      "risk"
    ]

  ];


  bindings.forEach(
    (
      [
        elementId,
        stateField
      ]
    ) => {

      document
        .getElementById(
          elementId
        )
        .addEventListener(
          "change",
          event => {

            dashboardState[
              stateField
            ] =
              event.target.value;


            updateDashboard();

          }
        );

    }
  );


  document
    .getElementById(
      "resetFilters"
    )
    .addEventListener(
      "click",
      resetAll
    );

}


/* =========================================================
   PLOT RESET EVENTS
   ========================================================= */

function connectResetButtons() {

  const resetMap = {

    trendReset:
      "trend",

    departmentReset:
      "department",

    riskReset:
      "risk",

    scatterReset:
      "scatter",

    heatmapReset:
      "heatmap",

    boxReset:
      "box",

    sankeyReset:
      "sankey"

  };


  Object.entries(
    resetMap
  )
    .forEach(
      (
        [
          buttonId,
          source
        ]
      ) => {

        document
          .getElementById(
            buttonId
          )
          .addEventListener(
            "click",
            () => {

              plotFilters[
                source
              ] =
                {};


              updateDashboard();

            }
          );

      }
    );

}


/* =========================================================
   RESET EVERYTHING
   ========================================================= */

function resetAll() {

  Object.assign(

    dashboardState,

    {

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

    }

  );


  Object.keys(
    plotFilters
  )
    .forEach(
      source => {

        plotFilters[
          source
        ] =
          {};

      }
    );


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


  clearHover();


  updateDashboard();

}


/* =========================================================
   APPLY DROPDOWN FILTERS
   ========================================================= */

function applyDropdownFilters(
  data
) {

  return data.filter(
    row => {

      if (
        dashboardState.year !==
          "all" &&

        String(row.year) !==
          String(
            dashboardState.year
          )
      ) {

        return false;

      }


      if (
        dashboardState.term !==
          "all" &&

        row.term !==
          dashboardState.term
      ) {

        return false;

      }


      if (
        dashboardState.department !==
          "all" &&

        row.department !==
          dashboardState.department
      ) {

        return false;

      }


      if (
        dashboardState.program !==
          "all" &&

        row.program !==
          dashboardState.program
      ) {

        return false;

      }


      if (
        dashboardState.studentType !==
          "all" &&

        row.student_type !==
          dashboardState.studentType
      ) {

        return false;

      }


      if (
        dashboardState.risk !==
          "all" &&

        row.risk_level !==
          dashboardState.risk
      ) {

        return false;

      }


      return true;

    }
  );

}


/* =========================================================
   APPLY PLOT FILTERS
   ========================================================= */

function applyPlotFilters(
  data,
  excludeSource = null
) {

  return data.filter(
    row => {

      for (
        const [
          source,
          filters
        ]
        of Object.entries(
          plotFilters
        )
      ) {

        if (
          source ===
          excludeSource
        ) {

          continue;

        }


        for (
          const [
            field,
            expected
          ]
          of Object.entries(
            filters
          )
        ) {

          if (
            field ===
            "student_ids"
          ) {

            if (
              !expected.includes(
                row.student_id
              )
            ) {

              return false;

            }


            continue;

          }


          if (
            String(
              row[field]
            ) !==
            String(
              expected
            )
          ) {

            return false;

          }

        }

      }


      return true;

    }
  );

}


/* =========================================================
   GET DATA FOR VIEW
   ========================================================= */

function getDataForView(
  source = null
) {

  const dropdownData =
    applyDropdownFilters(
      originalData
    );


  return applyPlotFilters(
    dropdownData,
    source
  );

}


/* =========================================================
   DASHBOARD UPDATE
   ========================================================= */

function updateDashboard() {

  filteredData =
    getDataForView();


  updateActiveFilters();

  updateResetButtons();

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
   ACTIVE FILTER DISPLAY
   ========================================================= */

function updateActiveFilters() {

  const container =
    document.getElementById(
      "activeFilters"
    );


  container.innerHTML =
    "";


  let count =
    0;


  const dropdowns = [

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


  dropdowns.forEach(
    (
      [
        label,
        value
      ]
    ) => {

      if (
        value !==
        "all"
      ) {

        addFilterChip(
          container,
          `${label}: ${value}`
        );


        count +=
          1;

      }

    }
  );


  Object.entries(
    plotFilters
  )
    .forEach(
      (
        [
          source,
          filters
        ]
      ) => {

        Object.entries(
          filters
        )
          .forEach(
            (
              [
                field,
                value
              ]
            ) => {

              let displayValue =
                value;


              if (
                field ===
                "student_ids"
              ) {

                displayValue =
                  `${value.length} students`;

              }


              addFilterChip(

                container,

                `${source}: ${displayValue}`

              );


              count +=
                1;

            }
          );

      }
    );


  if (
    count ===
    0
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

}


function addFilterChip(
  container,
  text
) {

  const chip =
    document.createElement(
      "span"
    );


  chip.className =
    "filter-chip";


  chip.textContent =
    text;


  container.appendChild(
    chip
  );

}


/* =========================================================
   RESET BUTTON STATES
   ========================================================= */

function updateResetButtons() {

  const map = {

    trendReset:
      "trend",

    departmentReset:
      "department",

    riskReset:
      "risk",

    scatterReset:
      "scatter",

    heatmapReset:
      "heatmap",

    boxReset:
      "box",

    sankeyReset:
      "sankey"

  };


  Object.entries(
    map
  )
    .forEach(
      (
        [
          buttonId,
          source
        ]
      ) => {

        document
          .getElementById(
            buttonId
          )
          .disabled =

            Object.keys(
              plotFilters[
                source
              ]
            )
              .length ===
            0;

      }
    );

}


/* =========================================================
   KPIs
   ========================================================= */

function updateMetrics() {

  const data =
    filteredData;


  const count =
    data.length;


  const retained =
    data.filter(
      row =>
        row.retained ===
        "Yes"
    ).length;


  const graduated =
    data.filter(
      row =>
        row.graduated ===
        "Yes"
    ).length;


  const highRisk =
    data.filter(
      row =>
        row.risk_level ===
        "High"
    ).length;


  const avgGPA =

    count

      ? data.reduce(
          (
            sum,
            row
          ) =>

            sum +
            Number(
              row.gpa
            ),

          0

        ) /
        count

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

      count

        ? `${(
            retained /
            count *
            100
          ).toFixed(1)}%`

        : "—";


  document
    .getElementById(
      "graduationRate"
    )
    .textContent =

      count

        ? `${(
            graduated /
            count *
            100
          ).toFixed(1)}%`

        : "—";


  document
    .getElementById(
      "averageGPA"
    )
    .textContent =

      count

        ? avgGPA.toFixed(
            2
          )

        : "—";


  document
    .getElementById(
      "highRiskRate"
    )
    .textContent =

      count

        ? `${(
            highRisk /
            count *
            100
          ).toFixed(1)}%`

        : "—";

}


/* =========================================================
   TREND
   ========================================================= */

function updateTrendChart() {

  const data =
    getDataForView(
      "trend"
    );


  const years =
    uniqueValues(
      data,
      "year"
    );


  const selectedYear =
    plotFilters
      .trend
      .year;


  const counts =
    years.map(
      year =>

        data.filter(
          row =>
            row.year ===
            year
        ).length

    );


  const retention =
    years.map(
      year => {

        const subset =
          data.filter(
            row =>
              row.year ===
              year
          );


        const retained =
          subset.filter(
            row =>
              row.retained ===
              "Yes"
          ).length;


        return (

          subset.length

            ? retained /
              subset.length *
              100

            : 0

        );

      }
    );


  const theme =
    getPlotTheme();


  Plotly.react(

    "trendChart",

    [

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
            years.map(
              year =>

                selectedYear ===
                  undefined ||

                String(year) ===
                  String(
                    selectedYear
                  )

                  ? colors.blue

                  : theme.grid

            )

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
          retention,

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

    ],

    themedLayout({

      margin: {

        t:
          15,

        r:
          65,

        b:
          55,

        l:
          60

      },

      xaxis: {
        title:
          "Academic year"
      },

      yaxis: {
        title:
          "Students"
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
          [0,100],

        tickfont: {
          color:
            theme.text
        },

        titlefont: {
          color:
            theme.text
        },

        gridcolor:
          theme.grid

      },

      legend: {

        orientation:
          "h",

        y:
          1.12

      }

    }),

    plotConfig

  )
    .then(
      () => {

        const plot =
          document.getElementById(
            "trendChart"
          );


        resetPlotListeners(
          plot
        );


        plot.on(

          "plotly_click",

          eventData => {

            const year =
              eventData
                .points?.[0]
                ?.x;


            if (
              year ===
              undefined
            ) {

              return;

            }


            plotFilters.trend =
              {

                year:
                  year

              };


            updateDashboard();

          }

        );


        plot.on(

          "plotly_hover",

          eventData => {

            const year =
              eventData
                .points?.[0]
                ?.x;


            if (
              year !==
              undefined
            ) {

              setHover(

                {
                  year:
                    year
                },

                `Highlighting ${year}`

              );

            }

          }

        );


        plot.on(
          "plotly_unhover",
          clearHover
        );

      }
    );

}


/* =========================================================
   DEPARTMENT
   ========================================================= */

function updateDepartmentChart() {

  const data =
    getDataForView(
      "department"
    );


  const departments =
    uniqueValues(
      data,
      "department"
    );


  const studentTypes =
    uniqueValues(
      data,
      "student_type"
    );


  const selected =
    plotFilters
      .department
      .department;


  const palette = [

    colors.blue,

    colors.navy,

    colors.purple

  ];


  const traces =
    studentTypes.map(
      (
        type,
        index
      ) => ({

        x:
          departments,

        y:
          departments.map(
            department =>

              data.filter(
                row =>

                  row.department ===
                    department &&

                  row.student_type ===
                    type

              ).length

          ),

        type:
          "bar",

        name:
          type,

        marker: {

          color:
            palette[
              index %
              palette.length
            ],

          opacity:
            departments.map(
              department =>

                selected ===
                  undefined ||

                department ===
                  selected

                  ? 1

                  : 0.25

            )

        },

        hovertemplate:

          "%{x}" +

          `<br>${type}: %{y:,}` +

          "<extra></extra>"

      })
    );


  Plotly.react(

    "departmentChart",

    traces,

    themedLayout({

      barmode:
        "stack",

      margin: {

        t:
          15,

        r:
          15,

        b:
          95,

        l:
          55

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

      }

    }),

    plotConfig

  )
    .then(
      () => {

        const plot =
          document.getElementById(
            "departmentChart"
          );


        resetPlotListeners(
          plot
        );


        plot.on(

          "plotly_click",

          eventData => {

            const department =
              eventData
                .points?.[0]
                ?.x;


            if (
              !department
            ) {

              return;

            }


            plotFilters.department =
              {

                department:
                  department

              };


            updateDashboard();

          }

        );


        plot.on(

          "plotly_hover",

          eventData => {

            const department =
              eventData
                .points?.[0]
                ?.x;


            if (
              department
            ) {

              setHover(

                {
                  department:
                    department
                },

                `Highlighting ${department}`

              );

            }

          }

        );


        plot.on(
          "plotly_unhover",
          clearHover
        );

      }
    );

}


/* =========================================================
   RISK DONUT
   ========================================================= */

function updateRiskChart() {

  const data =
    getDataForView(
      "risk"
    );


  const levels = [

    "Low",

    "Medium",

    "High"

  ];


  const selected =
    plotFilters
      .risk
      .risk_level;


  const values =
    levels.map(
      level =>

        data.filter(
          row =>
            row.risk_level ===
            level
        ).length

    );


  Plotly.react(

    "riskChart",

    [

      {

        labels:
          levels,

        values:
          values,

        type:
          "pie",

        hole:
          0.58,

        marker: {

          colors: [

            colors.green,

            colors.orange,

            colors.red

          ]

        },

        pull:
          levels.map(
            level =>

              level ===
                selected

                ? 0.10

                : 0

          ),

        textinfo:
          "percent",

        hovertemplate:

          "%{label}" +

          "<br>Students: %{value:,}" +

          "<br>%{percent}" +

          "<extra></extra>"

      }

    ],

    themedLayout({

      margin: {

        t:
          20,

        r:
          20,

        b:
          30,

        l:
          20

      },

      legend: {

        orientation:
          "h",

        y:
          -0.1

      }

    }),

    plotConfig

  )
    .then(
      () => {

        const plot =
          document.getElementById(
            "riskChart"
          );


        resetPlotListeners(
          plot
        );


        plot.on(

          "plotly_click",

          eventData => {

            const risk =
              eventData
                .points?.[0]
                ?.label;


            if (
              !risk
            ) {

              return;

            }


            plotFilters.risk =
              {

                risk_level:
                  risk

              };


            updateDashboard();

          }

        );


        plot.on(

          "plotly_hover",

          eventData => {

            const risk =
              eventData
                .points?.[0]
                ?.label;


            if (
              risk
            ) {

              setHover(

                {
                  risk_level:
                    risk
                },

                `Highlighting ${risk} risk`

              );

            }

          }

        );


        plot.on(
          "plotly_unhover",
          clearHover
        );

      }
    );

}


/* =========================================================
   SCATTER
   ========================================================= */

function updateScatterChart() {

  const data =
    getDataForView(
      "scatter"
    );


  const groups = {

    Low:
      data.filter(
        row =>
          row.risk_level ===
          "Low"
      ),

    Medium:
      data.filter(
        row =>
          row.risk_level ===
          "Medium"
      ),

    High:
      data.filter(
        row =>
          row.risk_level ===
          "High"
      )

  };


  const makeTrace =
    (
      rows,
      label,
      color
    ) => ({

      x:
        rows.map(
          row =>
            Number(
              row.attendance_rate
            )
        ),

      y:
        rows.map(
          row =>
            Number(
              row.gpa
            )
        ),

      customdata:
        rows.map(
          row => [

            row.student_id,

            row.department,

            row.program,

            row.risk_level,

            row.year,

            row.retained,

            row.graduated

          ]
        ),

      mode:
        "markers",

      type:
        "scattergl",

      name:
        `${label} risk`,

      marker: {

        size:
          rows.map(
            row =>

              6 +

              Number(
                row.advising_visits
              ) *
              1.3

          ),

        color:
          color,

        opacity:
          0.65

      },

      hovertemplate:

        "<b>%{customdata[0]}</b>" +

        "<br>%{customdata[1]}" +

        "<br>%{customdata[2]}" +

        "<br>Risk: %{customdata[3]}" +

        "<br>Attendance: %{x:.1f}%" +

        "<br>GPA: %{y:.2f}" +

        "<extra></extra>"

    });


  Plotly.react(

    "scatterChart",

    [

      makeTrace(
        groups.Low,
        "Low",
        colors.green
      ),

      makeTrace(
        groups.Medium,
        "Medium",
        colors.orange
      ),

      makeTrace(
        groups.High,
        "High",
        colors.red
      )

    ],

    themedLayout({

      dragmode:
        "lasso",

      margin: {

        t:
          15,

        r:
          30,

        b:
          60,

        l:
          60

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

      }

    }),

    plotConfig

  )
    .then(
      () => {

        const plot =
          document.getElementById(
            "scatterChart"
          );


        resetPlotListeners(
          plot
        );


        plot.on(

          "plotly_selected",

          eventData => {

            if (
              !eventData ||
              !eventData.points ||
              eventData.points.length ===
                0
            ) {

              return;

            }


            const ids =
              eventData.points

                .map(
                  point =>
                    point
                      .customdata?.[0]
                )

                .filter(
                  Boolean
                );


            plotFilters.scatter =
              {

                student_ids:
                  ids

              };


            updateDashboard();

          }

        );


        plot.on(

          "plotly_hover",

          eventData => {

            const id =
              eventData
                .points?.[0]
                ?.customdata?.[0];


            if (
              id
            ) {

              setHover(

                {
                  student_id:
                    id
                },

                `Highlighting ${id}`

              );

            }

          }

        );


        plot.on(
          "plotly_unhover",
          clearHover
        );

      }
    );

}


/* =========================================================
   HEATMAP
   ========================================================= */

function updateHeatmapChart() {

  const data =
    getDataForView(
      "heatmap"
    );


  const departments =
    uniqueValues(
      data,
      "department"
    );


  const years =
    uniqueValues(
      data,
      "year"
    );


  const z =
    departments.map(
      department =>

        years.map(
          year => {

            const subset =
              data.filter(
                row =>

                  row.department ===
                    department &&

                  row.year ===
                    year

              );


            if (
              subset.length ===
              0
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


  Plotly.react(

    "heatmapChart",

    [

      {

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
            0.5,
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

      }

    ],

    themedLayout({

      margin: {

        t:
          20,

        r:
          90,

        b:
          55,

        l:
          150

      },

      xaxis: {

        title:
          "Academic year"

      }

    }),

    plotConfig

  )
    .then(
      () => {

        const plot =
          document.getElementById(
            "heatmapChart"
          );


        resetPlotListeners(
          plot
        );


        plot.on(

          "plotly_click",

          eventData => {

            const point =
              eventData
                .points?.[0];


            if (
              !point
            ) {

              return;

            }


            plotFilters.heatmap =
              {

                department:
                  point.y,

                year:
                  point.x

              };


            updateDashboard();

          }

        );


        plot.on(

          "plotly_hover",

          eventData => {

            const point =
              eventData
                .points?.[0];


            if (
              !point
            ) {

              return;

            }


            setHover(

              {

                department:
                  point.y,

                year:
                  point.x

              },

              `Highlighting ${point.y}, ${point.x}`

            );

          }

        );


        plot.on(
          "plotly_unhover",
          clearHover
        );

      }
    );

}


/* =========================================================
   BOX PLOT
   ========================================================= */

function updateBoxChart() {

  const data =
    getDataForView(
      "box"
    );


  const departments =
    uniqueValues(
      data,
      "department"
    );


  const selected =
    plotFilters
      .box
      .department;


  const palette = [

    colors.blue,

    colors.green,

    colors.orange,

    colors.purple,

    colors.navy

  ];


  const traces =
    departments.map(
      (
        department,
        index
      ) => {

        const subset =
          data.filter(
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

          marker: {

            color:
              palette[
                index %
                palette.length
              ]

          },

          opacity:

            selected ===
              undefined ||

            department ===
              selected

              ? 1

              : .25

        };

      }
    );


  Plotly.react(

    "boxChart",

    traces,

    themedLayout({

      margin: {

        t:
          20,

        r:
          20,

        b:
          100,

        l:
          55

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
        false

    }),

    plotConfig

  )
    .then(
      () => {

        const plot =
          document.getElementById(
            "boxChart"
          );


        resetPlotListeners(
          plot
        );


        plot.on(

          "plotly_click",

          eventData => {

            const department =
              eventData
                .points?.[0]
                ?.data
                ?.name;


            if (
              !department
            ) {

              return;

            }


            plotFilters.box =
              {

                department:
                  department

              };


            updateDashboard();

          }

        );


        plot.on(

          "plotly_hover",

          eventData => {

            const department =
              eventData
                .points?.[0]
                ?.data
                ?.name;


            if (
              department
            ) {

              setHover(

                {
                  department:
                    department
                },

                `Highlighting ${department}`

              );

            }

          }

        );


        plot.on(
          "plotly_unhover",
          clearHover
        );

      }
    );

}


/* =========================================================
   SANKEY
   ========================================================= */

function updateSankeyChart() {

  const data =
    getDataForView(
      "sankey"
    );


  const labels = [

    "Low risk",

    "Medium risk",

    "High risk",

    "Retained",

    "Not retained",

    "Graduated",

    "Not graduated"

  ];


  const sources =
    [];


  const targets =
    [];


  const values =
    [];


  [
    "Low",
    "Medium",
    "High"
  ]
    .forEach(
      (
        risk,
        index
      ) => {

        const subset =
          data.filter(
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


        sources.push(
          index,
          index
        );


        targets.push(
          3,
          4
        );


        values.push(

          retained,

          subset.length -
          retained

        );

      }
    );


  const retainedStudents =
    data.filter(
      row =>
        row.retained ===
        "Yes"
    );


  const notRetainedStudents =
    data.filter(
      row =>
        row.retained !==
        "Yes"
    );


  const retainedGraduated =
    retainedStudents.filter(
      row =>
        row.graduated ===
        "Yes"
    ).length;


  const notRetainedGraduated =
    notRetainedStudents.filter(
      row =>
        row.graduated ===
        "Yes"
    ).length;


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

    retainedStudents.length -
      retainedGraduated,

    notRetainedGraduated,

    notRetainedStudents.length -
      notRetainedGraduated

  );


  const theme =
    getPlotTheme();


  Plotly.react(

    "sankeyChart",

    [

      {

        type:
          "sankey",

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

            theme.grid

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

      }

    ],

    themedLayout({

      margin: {

        t:
          20,

        r:
          20,

        b:
          20,

        l:
          20

      }

    }),

    plotConfig

  )
    .then(
      () => {

        const plot =
          document.getElementById(
            "sankeyChart"
          );


        resetPlotListeners(
          plot
        );


        plot.on(

          "plotly_click",

          eventData => {

            const label =
              eventData
                .points?.[0]
                ?.label;


            if (
              label ===
              "Retained"
            ) {

              plotFilters.sankey =
                {

                  retained:
                    "Yes"

                };

            }

            else if (
              label ===
              "Not retained"
            ) {

              plotFilters.sankey =
                {

                  retained:
                    "No"

                };

            }

            else if (
              label ===
              "Graduated"
            ) {

              plotFilters.sankey =
                {

                  graduated:
                    "Yes"

                };

            }

            else if (
              label ===
              "Not graduated"
            ) {

              plotFilters.sankey =
                {

                  graduated:
                    "No"

                };

            }

            else {

              return;

            }


            updateDashboard();

          }

        );

      }
    );

}


/* =========================================================
   TABLE HEADER
   ========================================================= */

function buildTableHeader() {

  const row =
    document.getElementById(
      "studentTableHeader"
    );


  row.innerHTML =
    "";


  columns.forEach(
    (
      [
        field,
        label
      ]
    ) => {

      const th =
        document.createElement(
          "th"
        );


      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "sort-button";


      button.dataset.field =
        field;


      button.innerHTML =

        `${label}` +

        `<span class="sort-indicator"></span>`;


      button.addEventListener(

        "click",

        () => {

          if (
            tableState.sortField ===
            field
          ) {

            tableState.sortDirection =

              tableState.sortDirection ===
                "asc"

                ? "desc"

                : "asc";

          }

          else {

            tableState.sortField =
              field;


            tableState.sortDirection =
              "asc";

          }


          updateStudentTable();

        }

      );


      th.appendChild(
        button
      );


      row.appendChild(
        th
      );

    }
  );

}


/* =========================================================
   TABLE
   ========================================================= */

function updateStudentTable() {

  const tbody =
    document.querySelector(
      "#studentTable tbody"
    );


  tbody.innerHTML =
    "";


  const sorted =
    [
      ...filteredData
    ]
      .sort(
        (
          a,
          b
        ) =>

          compareValues(

            a[
              tableState.sortField
            ],

            b[
              tableState.sortField
            ],

            tableState.sortDirection

          )
      );


  const rows =
    sorted.slice(
      0,
      250
    );


  const ranges =
    getNumericRanges(
      filteredData
    );


  updateSortIndicators();


  rows.forEach(
    row => {

      const tr =
        document.createElement(
          "tr"
        );


      tr.dataset.studentId =
        row.student_id;


      tr.dataset.year =
        row.year;


      tr.dataset.department =
        row.department;


      tr.dataset.riskLevel =
        row.risk_level;


      tr.dataset.retained =
        row.retained;


      tr.dataset.graduated =
        row.graduated;


      columns.forEach(
        (
          [
            field
          ]
        ) => {

          const td =
            document.createElement(
              "td"
            );


          const value =
            row[field];


          td.textContent =
            formatCell(
              field,
              value
            );


          if (
            numericFields.has(
              field
            ) &&

            Number.isFinite(
              Number(value)
            )
          ) {

            td.style.background =
              numericColor(

                Number(value),

                ranges[
                  field
                ]

              );

          }


          if (
            field ===
            "risk_level"
          ) {

            td.classList.add(

              `risk-${String(
                value
              ).toLowerCase()}`

            );

          }


          tr.appendChild(
            td
          );

        }
      );


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

      " shown of " +

      `${filteredData.length.toLocaleString()}`;

}


/* =========================================================
   TABLE SORT
   ========================================================= */

function updateSortIndicators() {

  document
    .querySelectorAll(
      ".sort-button"
    )
    .forEach(
      button => {

        const indicator =
          button.querySelector(
            ".sort-indicator"
          );


        if (
          button.dataset.field ===
          tableState.sortField
        ) {

          indicator.textContent =

            tableState.sortDirection ===
              "asc"

              ? " ▲"

              : " ▼";

        }

        else {

          indicator.textContent =
            "";

        }

      }
    );

}


function compareValues(
  a,
  b,
  direction
) {

  const factor =

    direction ===
      "asc"

      ? 1

      : -1;


  const aNumber =
    Number(a);


  const bNumber =
    Number(b);


  if (
    Number.isFinite(
      aNumber
    ) &&

    Number.isFinite(
      bNumber
    )
  ) {

    return (

      aNumber -
      bNumber

    ) *
    factor;

  }


  return String(
    a ?? ""
  )
    .localeCompare(
      String(
        b ?? ""
      )
    ) *
    factor;

}


/* =========================================================
   NUMERIC TABLE COLORS
   ========================================================= */

function getNumericRanges(
  data
) {

  const ranges =
    {};


  numericFields.forEach(
    field => {

      const values =
        data

          .map(
            row =>
              Number(
                row[field]
              )
          )

          .filter(
            Number.isFinite
          );


      ranges[field] =

        values.length

          ? {

              min:
                Math.min(
                  ...values
                ),

              max:
                Math.max(
                  ...values
                )

            }

          : {

              min:
                0,

              max:
                1

            };

    }
  );


  return ranges;

}


function numericColor(
  value,
  range
) {

  const span =

    range.max -
    range.min ||
    1;


  const proportion =
    Math.max(

      0,

      Math.min(

        1,

        (
          value -
          range.min
        ) /
        span

      )

    );


  const dark =
    getResolvedTheme() ===
    "dark";


  const hue =
    210 -
    proportion *
    105;


  if (
    dark
  ) {

    const lightness =

      18 +
      proportion *
      7;


    return (

      `hsl(` +

      `${hue} ` +

      `38% ` +

      `${lightness}%` +

      `)`

    );

  }


  const lightness =

    96 -
    proportion *
    14;


  return (

    `hsl(` +

    `${hue} ` +

    `55% ` +

    `${lightness}%` +

    `)`

  );

}


/* =========================================================
   CELL FORMATTING
   ========================================================= */

function formatCell(
  field,
  value
) {

  if (
    value ===
      null ||

    value ===
      undefined ||

    value ===
      ""
  ) {

    return "";

  }


  if (
    field ===
    "gpa"
  ) {

    return Number(
      value
    ).toFixed(
      2
    );

  }


  if (
    field ===
      "attendance_rate" ||

    field ===
      "completion_rate" ||

    field ===
      "engagement_score"
  ) {

    return Number(
      value
    ).toFixed(
      1
    );

  }


  if (
    field ===
      "retention_probability" ||

    field ===
      "graduation_probability"
  ) {

    return `${(
      Number(value) *
      100
    ).toFixed(1)}%`;

  }


  if (
    field ===
    "unmet_financial_need"
  ) {

    return (

      "$" +

      Number(
        value
      )
        .toLocaleString()

    );

  }


  return String(
    value
  );

}


/* =========================================================
   HOVER
   ========================================================= */

function setHover(
  filters,
  message
) {

  hoverState.filters =
    filters;


  hoverState.message =
    message;


  const status =
    document.getElementById(
      "hoverStatus"
    );


  if (
    status
  ) {

    status.textContent =
      message;

  }


  highlightTable();

}


function clearHover() {

  hoverState.filters =
    {};


  hoverState.message =
    null;


  const status =
    document.getElementById(
      "hoverStatus"
    );


  if (
    status
  ) {

    status.textContent =

      "Hover over a mark to highlight related students. " +

      "Click categorical marks to filter the other visualizations.";

  }


  highlightTable();

}


/* =========================================================
   HIGHLIGHT TABLE ROWS
   ========================================================= */

function highlightTable() {

  const rows =
    document.querySelectorAll(
      "#studentTable tbody tr"
    );


  const filters =
    hoverState.filters;


  if (
    Object.keys(
      filters
    ).length ===
    0
  ) {

    rows.forEach(
      row => {

        row.style.opacity =
          "1";

      }
    );


    return;

  }


  rows.forEach(
    row => {

      const rowValues = {

        student_id:
          row.dataset.studentId,

        year:
          row.dataset.year,

        department:
          row.dataset.department,

        risk_level:
          row.dataset.riskLevel,

        retained:
          row.dataset.retained,

        graduated:
          row.dataset.graduated

      };


      let matches =
        true;


      Object.entries(
        filters
      )
        .forEach(
          (
            [
              field,
              expected
            ]
          ) => {

            if (
              String(
                rowValues[
                  field
                ]
              ) !==
              String(
                expected
              )
            ) {

              matches =
                false;

            }

          }
        );


      row.style.opacity =

        matches

          ? "1"

          : ".22";

    }
  );

}


/* =========================================================
   REMOVE OLD PLOTLY EVENT HANDLERS
   ========================================================= */

function resetPlotListeners(
  plot
) {

  if (
    !plot ||
    !plot.removeAllListeners
  ) {

    return;

  }


  [

    "plotly_click",

    "plotly_hover",

    "plotly_unhover",

    "plotly_selected"

  ]
    .forEach(
      eventName => {

        plot.removeAllListeners(
          eventName
        );

      }
    );

}
