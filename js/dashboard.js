let originalData = [];

let enrollmentChart = null;
let retentionChart = null;


Papa.parse(
  "data/enrollment.csv",
  {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,

    complete: function(results) {

      originalData = results.data;

      populateFilters();

      createCharts();

      updateDashboard();

    }
  }
);


function populateFilters() {

  const years = [
    ...new Set(
      originalData.map(row => row.year)
    )
  ].sort();


  const departments = [
    ...new Set(
      originalData.map(row => row.department)
    )
  ].sort();


  const yearFilter =
    document.getElementById("yearFilter");


  const departmentFilter =
    document.getElementById("departmentFilter");


  years.forEach(year => {

    const option =
      document.createElement("option");

    option.value = year;
    option.textContent = year;

    yearFilter.appendChild(option);

  });


  departments.forEach(department => {

    const option =
      document.createElement("option");

    option.value = department;
    option.textContent = department;

    departmentFilter.appendChild(option);

  });


  yearFilter.addEventListener(
    "change",
    updateDashboard
  );


  departmentFilter.addEventListener(
    "change",
    updateDashboard
  );

}


function createCharts() {

  const enrollmentContext =
    document
      .getElementById("enrollmentChart")
      .getContext("2d");


  enrollmentChart =
    new Chart(
      enrollmentContext,
      {
        type: "bar",

        data: {
          labels: [],
          datasets: [
            {
              label: "Enrollment",
              data: [],
              backgroundColor: "#2e75b6",
              borderRadius: 5
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

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


  const retentionContext =
    document
      .getElementById("retentionChart")
      .getContext("2d");


  retentionChart =
    new Chart(
      retentionContext,
      {
        type: "line",

        data: {
          labels: [],
          datasets: [
            {
              label: "Retention rate",
              data: [],
              borderColor: "#2e75b6",
              backgroundColor: "#2e75b6",
              tension: 0.3
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          scales: {
            y: {
              beginAtZero: true,
              max: 100,

              ticks: {
                callback: value =>
                  `${value}%`
              }
            }
          }
        }
      }
    );

}


function getFilteredData() {

  const selectedYear =
    document
      .getElementById("yearFilter")
      .value;


  const selectedDepartment =
    document
      .getElementById("departmentFilter")
      .value;


  return originalData.filter(row => {

    const yearMatch =
      selectedYear === "all" ||
      row.year === Number(selectedYear);


    const departmentMatch =
      selectedDepartment === "all" ||
      row.department === selectedDepartment;


    return yearMatch && departmentMatch;

  });

}


function updateDashboard() {

  const filteredData =
    getFilteredData();


  updateMetrics(filteredData);

  updateEnrollmentChart(filteredData);

  updateRetentionChart(filteredData);

}


function updateMetrics(data) {

  const totalEnrollment =
    data.reduce(
      (sum, row) =>
        sum + row.enrollment,
      0
    );


  const averageRetention =
    data.length > 0
      ? data.reduce(
          (sum, row) =>
            sum + row.retention,
          0
        ) / data.length
      : 0;


  const totalRisk =
    data.reduce(
      (sum, row) =>
        sum + row.risk,
      0
    );


  document
    .getElementById("totalEnrollment")
    .textContent =
      totalEnrollment.toLocaleString();


  document
    .getElementById("avgRetention")
    .textContent =
      `${averageRetention.toFixed(1)}%`;


  document
    .getElementById("totalRisk")
    .textContent =
      totalRisk.toLocaleString();

}


function updateEnrollmentChart(data) {

  const grouped =
    groupByDepartment(data);


  enrollmentChart.data.labels =
    grouped.map(row => row.department);


  enrollmentChart.data.datasets[0].data =
    grouped.map(row => row.enrollment);


  enrollmentChart.update();

}


function updateRetentionChart(data) {

  const grouped =
    groupByYear(data);


  retentionChart.data.labels =
    grouped.map(row => row.year);


  retentionChart.data.datasets[0].data =
    grouped.map(row => row.retention);


  retentionChart.update();

}


function groupByDepartment(data) {

  const groups = {};


  data.forEach(row => {

    if (!groups[row.department]) {

      groups[row.department] = {
        department: row.department,
        enrollment: 0
      };

    }


    groups[row.department].enrollment +=
      row.enrollment;

  });


  return Object.values(groups);

}


function groupByYear(data) {

  const groups = {};


  data.forEach(row => {

    if (!groups[row.year]) {

      groups[row.year] = {
        year: row.year,
        retentionTotal: 0,
        count: 0
      };

    }


    groups[row.year].retentionTotal +=
      row.retention;


    groups[row.year].count += 1;

  });


  return Object
    .values(groups)
    .map(row => ({
      year: row.year,

      retention:
        row.retentionTotal /
        row.count
    }))
    .sort(
      (a, b) =>
        a.year - b.year
    );

}
