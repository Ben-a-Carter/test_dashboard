let originalData = [];
let filteredData = [];

let enrollmentChart = null;
let riskChart = null;
let departmentChart = null;


const colors = {
  navy: "#1f3864",
  blue: "#2e75b6",
  green: "#548235",
  orange: "#d98c31",
  red: "#c94c4c",
  lightBlue: "#dce8f4"
};


Papa.parse(
  "data/students.csv",
  {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,

    complete: function(results) {

      originalData =
        results.data.filter(
          row => row.student_id
        );

      populateFilters();

      createCharts();

      updateDashboard();

    },

    error: function(error) {

      console.error(
        "Unable to load students.csv:",
        error
      );

    }
  }
);


function populateFilters() {

  populateSelect(
    "yearFilter",
    uniqueValues("year")
  );


  populateSelect(
    "departmentFilter",
    uniqueValues("department")
  );


  populateSelect(
    "studentTypeFilter",
    uniqueValues("student_type")
  );


  populateSelect(
    "riskFilter",
    ["Low", "Medium", "High"]
  );


  [
    "yearFilter",
    "departmentFilter",
    "studentTypeFilter",
    "riskFilter"
  ].forEach(id => {

    document
      .getElementById(id)
      .addEventListener(
        "change",
        updateDashboard
      );

  });


  document
    .getElementById("resetFilters")
    .addEventListener(
      "click",
      resetFilters
    );

}


function uniqueValues(field) {

  return [
    ...new Set(
      originalData
        .map(row => row[field])
        .filter(
          value =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )
    )
  ].sort();

}


function populateSelect(
  elementId,
  values
) {

  const select =
    document.getElementById(
      elementId
    );


  values.forEach(value => {

    const option =
      document.createElement(
        "option"
      );


    option.value = value;
    option.textContent = value;


    select.appendChild(option);

  });

}


function resetFilters() {

  document
    .getElementById("yearFilter")
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


function getFilteredData() {

  const year =
    document
      .getElementById("yearFilter")
      .value;


  const department =
    document
      .getElementById(
        "departmentFilter"
      )
      .value;


  const studentType =
    document
      .getElementById(
        "studentTypeFilter"
      )
      .value;


  const risk =
    document
      .getElementById("riskFilter")
      .value;


  return originalData.filter(row => {

    const yearMatch =
      year === "all" ||
      String(row.year) === year;


    const departmentMatch =
      department === "all" ||
      row.department === department;


    const typeMatch =
      studentType === "all" ||
      row.student_type === studentType;


    const riskMatch =
      risk === "all" ||
      row.risk_level === risk;


    return (
      yearMatch &&
      departmentMatch &&
      typeMatch &&
      riskMatch
    );

  });

}


function createCharts() {

  createEnrollmentChart();

  createRiskChart();

  createDepartmentChart();

}


function createEnrollmentChart() {

  enrollmentChart =
    new Chart(
      document.getElementById(
        "enrollmentChart"
      ),
      {
        type: "line",

        data: {
          labels: [],

          datasets: [
            {
              label: "Students",
              data: [],

              borderColor:
                colors.blue,

              backgroundColor:
                colors.lightBlue,

              fill: true,

              tension: 0.3,

              pointRadius: 4,

              pointHoverRadius: 7
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          interaction: {
            intersect: false,
            mode: "index"
          },

          plugins: {
            legend: {
              display: false
            }
          },

          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      }
    );

}


function createRiskChart() {

  riskChart =
    new Chart(
      document.getElementById(
        "riskChart"
      ),
      {
        type: "doughnut",

        data: {
          labels: [
            "Low",
            "Medium",
            "High"
          ],

          datasets: [
            {
              data: [],

              backgroundColor: [
                colors.green,
                colors.orange,
                colors.red
              ],

              borderWidth: 0
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          cutout: "62%",

          plugins: {
            legend: {
              position: "bottom"
            }
          }
        }
      }
    );

}


function createDepartmentChart() {

  departmentChart =
    new Chart(
      document.getElementById(
        "departmentChart"
      ),
      {
        type: "bar",

        data: {
          labels: [],

          datasets: [
            {
              label:
                "Undergraduate",

              data: [],

              backgroundColor:
                colors.blue
            },

            {
              label:
                "Graduate",

              data: [],

              backgroundColor:
                colors.navy
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          onClick:
            function(
              event,
              elements
            ) {

              if (
                elements.length === 0
              ) {
                return;
              }


              const index =
                elements[0].index;


              const department =
                this.data.labels[
                  index
                ];


              document
                .getElementById(
                  "departmentFilter"
                )
                .value =
                  department;


              updateDashboard();

            },

          scales: {

            x: {
              stacked: true
            },

            y: {
              stacked: true,
              beginAtZero: true
            }

          }
        }
      }
    );

}


function updateDashboard() {

  filteredData =
    getFilteredData();


  updateMetrics();

  updateEnrollmentChart();

  updateRiskChart();

  updateDepartmentChart();

  updateScatterPlot();

  updateRetentionHeatmap();

  updateStudentTable();

}


function updateMetrics() {

  const count =
    filteredData.length;


  const retained =
    filteredData.filter(
      row =>
        row.retained === "Yes"
    ).length;


  const highRisk =
    filteredData.filter(
      row =>
        row.risk_level === "High"
    ).length;


  const avgGPA =
    count > 0
      ? filteredData.reduce(
          (sum, row) =>
            sum +
            Number(row.gpa),
          0
        ) / count
      : 0;


  const retentionRate =
    count > 0
      ? retained /
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


function updateEnrollmentChart() {

  const years =
    uniqueSortedValues(
      filteredData,
      "year"
    );


  const counts =
    years.map(
      year =>
        filteredData.filter(
          row =>
            row.year === year
        ).length
    );


  enrollmentChart.data.labels =
    years;


  enrollmentChart
    .data
    .datasets[0]
    .data =
      counts;


  enrollmentChart.update();

}


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
            row.risk_level === level
        ).length
    );


  riskChart
    .data
    .datasets[0]
    .data =
      values;


  riskChart.update();

}


function updateDepartmentChart() {

  const departments =
    uniqueSortedValues(
      filteredData,
      "department"
    );


  const undergraduate =
    departments.map(
      department =>
        filteredData.filter(
          row =>
            row.department ===
              department &&
            row.student_type ===
              "Undergraduate"
        ).length
    );


  const graduate =
    departments.map(
      department =>
        filteredData.filter(
          row =>
            row.department ===
              department &&
            row.student_type ===
              "Graduate"
        ).length
    );


  departmentChart.data.labels =
    departments;


  departmentChart
    .data
    .datasets[0]
    .data =
      undergraduate;


  departmentChart
    .data
    .datasets[1]
    .data =
      graduate;


  departmentChart.update();

}


function updateScatterPlot() {

  const markerSizes =
    filteredData.map(
      row =>
        6 +
        Number(
          row.advising_visits
        ) *
        1.5
    );


  const trace = {

    x:
      filteredData.map(
        row =>
          Number(
            row.credits_completed
          )
      ),

    y:
      filteredData.map(
        row =>
          Number(row.gpa)
      ),

    text:
      filteredData.map(
        row =>
          `${row.student_id}` +
          `<br>${row.department}` +
          `<br>${row.student_type}` +
          `<br>Risk: ${row.risk_level}`
      ),

    mode: "markers",

    type: "scattergl",

    marker: {
      size: markerSizes,

      color:
        filteredData.map(
          row => {

            if (
              row.risk_level ===
              "High"
            ) {
              return colors.red;
            }


            if (
              row.risk_level ===
              "Medium"
            ) {
              return colors.orange;
            }


            return colors.green;

          }
        ),

      opacity: 0.65
    },

    hovertemplate:
      "%{text}" +
      "<br>Credits: %{x}" +
      "<br>GPA: %{y:.2f}" +
      "<extra></extra>"

  };


  const layout = {

    margin: {
      t: 15,
      r: 20,
      b: 55,
      l: 55
    },

    xaxis: {
      title:
        "Credits completed",

      zeroline: false
    },

    yaxis: {
      title:
        "GPA",

      range: [0, 4.05]
    },

    paper_bgcolor:
      "rgba(0,0,0,0)",

    plot_bgcolor:
      "rgba(0,0,0,0)",

    showlegend: false

  };


  Plotly.react(
    "gpaScatter",
    [trace],
    layout,
    {
      responsive: true,
      displaylogo: false
    }
  );

}


function updateRetentionHeatmap() {

  const departments =
    uniqueSortedValues(
      filteredData,
      "department"
    );


  const years =
    uniqueSortedValues(
      filteredData,
      "year"
    );


  const z =
    departments.map(
      department => {

        return years.map(
          year => {

            const subset =
              filteredData.filter(
                row =>
                  row.department ===
                    department &&
                  row.year === year
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
        );

      }
    );


  const trace = {

    type: "heatmap",

    x: years,

    y: departments,

    z: z,

    zmin: 50,
    zmax: 100,

    colorscale: [
      [0, "#f3d5d5"],
      [0.5, "#f2e1b5"],
      [1, "#cfe3cb"]
    ],

    hovertemplate:
      "%{y}" +
      "<br>Year: %{x}" +
      "<br>Retention: %{z:.1f}%" +
      "<extra></extra>"

  };


  const layout = {

    margin: {
      t: 15,
      r: 25,
      b: 55,
      l: 120
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
    "retentionHeatmap",
    [trace],
    layout,
    {
      responsive: true,
      displaylogo: false
    }
  );

}


function updateStudentTable() {

  const tbody =
    document
      .querySelector(
        "#studentTable tbody"
      );


  tbody.innerHTML = "";


  const rows =
    filteredData.slice(
      0,
      100
    );


  rows.forEach(row => {

    const tr =
      document.createElement(
        "tr"
      );


    tr.innerHTML = `
      <td>${row.student_id}</td>
      <td>${row.year}</td>
      <td>${row.department}</td>
      <td>${row.student_type}</td>
      <td>${Number(row.gpa).toFixed(2)}</td>
      <td>${row.credits_completed}</td>
      <td>${Number(row.attendance_rate).toFixed(1)}%</td>
      <td class="risk-${row.risk_level.toLowerCase()}">
        ${row.risk_level}
      </td>
      <td>${row.retained}</td>
    `;


    tbody.appendChild(tr);

  });


  document
    .getElementById(
      "tableCount"
    )
    .textContent =
      `${rows.length.toLocaleString()} of ${filteredData.length.toLocaleString()}`;

}


function uniqueSortedValues(
  data,
  field
) {

  return [
    ...new Set(
      data.map(
        row => row[field]
      )
    )
  ].sort(
    (a, b) => {

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
