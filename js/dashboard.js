let originalData = [];
let filteredData = [];
let selectedStudentIds = new Set();

const dashboardState = {
  year: "all",
  term: "all",
  department: "all",
  program: "all",
  studentType: "all",
  risk: "all"
};

const plotState = {
  trendYear: null,
  department: null,
  risk: null,
  scatterIds: new Set(),
  heatmapYear: null,
  heatmapDepartment: null,
  boxDepartment: null,
  sankeyRetained: null,
  sankeyGraduated: null
};

const hoverState = {
  field: null,
  value: null,
  secondaryField: null,
  secondaryValue: null
};

const tableState = {
  sortField: "student_id",
  sortDirection: "asc"
};

const colors = {
  navy: "#1f3864",
  blue: "#2e75b6",
  green: "#548235",
  orange: "#d98c31",
  red: "#c94c4c",
  purple: "#7665a8",
  gray: "#73726c"
};

const plotConfig = {
  responsive: true,
  displaylogo: false
};

const columns = [
  ["student_id", "Student"],
  ["year", "Year"],
  ["term", "Term"],
  ["department", "Department"],
  ["program", "Program"],
  ["student_type", "Student type"],
  ["gender", "Gender"],
  ["race_ethnicity", "Race / ethnicity"],
  ["age", "Age"],
  ["residency_status", "Residency"],
  ["first_generation", "First generation"],
  ["financial_aid", "Financial aid"],
  ["unmet_financial_need", "Unmet need"],
  ["credits_attempted", "Credits attempted"],
  ["credits_completed", "Credits completed"],
  ["completion_rate", "Completion rate"],
  ["attendance_rate", "Attendance"],
  ["engagement_score", "Engagement"],
  ["advising_visits", "Advising visits"],
  ["tutoring_visits", "Tutoring visits"],
  ["online_courses", "Online courses"],
  ["gpa", "GPA"],
  ["risk_level", "Risk"],
  ["retention_probability", "Retention probability"],
  ["retained", "Retained"],
  ["graduation_probability", "Graduation probability"],
  ["graduated", "Graduated"]
];

const numericFields = new Set([
  "year", "age", "unmet_financial_need", "credits_attempted",
  "credits_completed", "completion_rate", "attendance_rate",
  "engagement_score", "advising_visits", "tutoring_visits",
  "online_courses", "gpa", "retention_probability",
  "graduation_probability"
]);

Papa.parse("./data/students.csv", {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function(results) {
    originalData = results.data.filter(row => row.student_id);
    initializeDashboard();
  },
  error: function(error) {
    console.error("Unable to load students.csv", error);
  }
});

function initializeDashboard() {
  populateFilters();
  buildTableHeader();
  connectFilterEvents();
  connectResetButtons();
  updateDashboard();
}

function populateFilters() {
  populateSelect("yearFilter", uniqueValues(originalData, "year"));
  populateSelect("termFilter", uniqueValues(originalData, "term"));
  populateSelect("departmentFilter", uniqueValues(originalData, "department"));
  populateSelect("programFilter", uniqueValues(originalData, "program"));
  populateSelect("studentTypeFilter", uniqueValues(originalData, "student_type"));
  populateSelect("riskFilter", ["Low", "Medium", "High"]);
}

function populateSelect(elementId, values) {
  const select = document.getElementById(elementId);
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function uniqueValues(data, field) {
  return [...new Set(
    data.map(row => row[field]).filter(
      value => value !== null && value !== undefined && value !== ""
    )
  )].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b));
  });
}

function connectFilterEvents() {
  [
    ["yearFilter", "year"],
    ["termFilter", "term"],
    ["departmentFilter", "department"],
    ["programFilter", "program"],
    ["studentTypeFilter", "studentType"],
    ["riskFilter", "risk"]
  ].forEach(([id, key]) => {
    document.getElementById(id).addEventListener("change", event => {
      dashboardState[key] = event.target.value;
      updateDashboard();
    });
  });

  document.getElementById("resetFilters").addEventListener("click", resetAll);
}

function connectResetButtons() {
  document.getElementById("trendReset").addEventListener("click", () => {
    plotState.trendYear = null;
    updateDashboard();
  });

  document.getElementById("departmentReset").addEventListener("click", () => {
    plotState.department = null;
    updateDashboard();
  });

  document.getElementById("riskReset").addEventListener("click", () => {
    plotState.risk = null;
    updateDashboard();
  });

  document.getElementById("scatterReset").addEventListener("click", () => {
    plotState.scatterIds.clear();
    selectedStudentIds.clear();
    updateDashboard();
  });

  document.getElementById("heatmapReset").addEventListener("click", () => {
    plotState.heatmapYear = null;
    plotState.heatmapDepartment = null;
    updateDashboard();
  });

  document.getElementById("boxReset").addEventListener("click", () => {
    plotState.boxDepartment = null;
    updateDashboard();
  });

  document.getElementById("sankeyReset").addEventListener("click", () => {
    plotState.sankeyRetained = null;
    plotState.sankeyGraduated = null;
    updateDashboard();
  });
}

function resetAll() {
  Object.assign(dashboardState, {
    year: "all",
    term: "all",
    department: "all",
    program: "all",
    studentType: "all",
    risk: "all"
  });

  plotState.trendYear = null;
  plotState.department = null;
  plotState.risk = null;
  plotState.scatterIds.clear();
  plotState.heatmapYear = null;
  plotState.heatmapDepartment = null;
  plotState.boxDepartment = null;
  plotState.sankeyRetained = null;
  plotState.sankeyGraduated = null;

  selectedStudentIds.clear();

  document.getElementById("yearFilter").value = "all";
  document.getElementById("termFilter").value = "all";
  document.getElementById("departmentFilter").value = "all";
  document.getElementById("programFilter").value = "all";
  document.getElementById("studentTypeFilter").value = "all";
  document.getElementById("riskFilter").value = "all";

  updateDashboard();
}

function getFilteredData(excludePlot = null) {
  return originalData.filter(row => {
    if (dashboardState.year !== "all" && String(row.year) !== String(dashboardState.year)) return false;
    if (dashboardState.term !== "all" && row.term !== dashboardState.term) return false;
    if (dashboardState.department !== "all" && row.department !== dashboardState.department) return false;
    if (dashboardState.program !== "all" && row.program !== dashboardState.program) return false;
    if (dashboardState.studentType !== "all" && row.student_type !== dashboardState.studentType) return false;
    if (dashboardState.risk !== "all" && row.risk_level !== dashboardState.risk) return false;

    if (excludePlot !== "trend" && plotState.trendYear !== null &&
        String(row.year) !== String(plotState.trendYear)) return false;

    if (excludePlot !== "department" && plotState.department !== null &&
        row.department !== plotState.department) return false;

    if (excludePlot !== "risk" && plotState.risk !== null &&
        row.risk_level !== plotState.risk) return false;

    if (excludePlot !== "scatter" && plotState.scatterIds.size > 0 &&
        !plotState.scatterIds.has(row.student_id)) return false;

    if (excludePlot !== "heatmap") {
      if (plotState.heatmapYear !== null &&
          String(row.year) !== String(plotState.heatmapYear)) return false;
      if (plotState.heatmapDepartment !== null &&
          row.department !== plotState.heatmapDepartment) return false;
    }

    if (excludePlot !== "box" && plotState.boxDepartment !== null &&
        row.department !== plotState.boxDepartment) return false;

    if (excludePlot !== "sankey") {
      if (plotState.sankeyRetained !== null &&
          row.retained !== plotState.sankeyRetained) return false;
      if (plotState.sankeyGraduated !== null &&
          row.graduated !== plotState.sankeyGraduated) return false;
    }

    return true;
  });
}

function updateDashboard() {
  filteredData = getFilteredData();

  updateActiveFilters();
  updateResetButtonStates();
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

function updateActiveFilters() {
  const container = document.getElementById("activeFilters");
  container.innerHTML = "";

  const items = [
    ["Year", dashboardState.year],
    ["Term", dashboardState.term],
    ["Department", dashboardState.department],
    ["Program", dashboardState.program],
    ["Student type", dashboardState.studentType],
    ["Risk", dashboardState.risk],
    ["Trend", plotState.trendYear ? `Year ${plotState.trendYear}` : null],
    ["Department chart", plotState.department],
    ["Risk chart", plotState.risk],
    ["Scatter", plotState.scatterIds.size ? `${plotState.scatterIds.size} students` : null],
    ["Heatmap",
      plotState.heatmapYear && plotState.heatmapDepartment
        ? `${plotState.heatmapDepartment}, ${plotState.heatmapYear}`
        : null
    ],
    ["Box plot", plotState.boxDepartment],
    ["Outcomes",
      plotState.sankeyRetained ? `Retained: ${plotState.sankeyRetained}` : null
    ],
    ["Outcomes",
      plotState.sankeyGraduated ? `Graduated: ${plotState.sankeyGraduated}` : null
    ]
  ];

  let count = 0;

  items.forEach(([label, value]) => {
    if (value !== null && value !== "all") {
      count += 1;
      const chip = document.createElement("span");
      chip.className = "filter-chip";
      chip.textContent = `${label}: ${value}`;
      container.appendChild(chip);
    }
  });

  if (count === 0) {
    const text = document.createElement("span");
    text.className = "no-filter";
    text.textContent = "No filters or plot actions applied";
    container.appendChild(text);
  }
}

function updateResetButtonStates() {
  document.getElementById("trendReset").disabled = plotState.trendYear === null;
  document.getElementById("departmentReset").disabled = plotState.department === null;
  document.getElementById("riskReset").disabled = plotState.risk === null;
  document.getElementById("scatterReset").disabled = plotState.scatterIds.size === 0;
  document.getElementById("heatmapReset").disabled =
    plotState.heatmapYear === null && plotState.heatmapDepartment === null;
  document.getElementById("boxReset").disabled = plotState.boxDepartment === null;
  document.getElementById("sankeyReset").disabled =
    plotState.sankeyRetained === null && plotState.sankeyGraduated === null;
}

function updateMetrics() {
  const count = filteredData.length;
  const retained = filteredData.filter(row => row.retained === "Yes").length;
  const graduated = filteredData.filter(row => row.graduated === "Yes").length;
  const highRisk = filteredData.filter(row => row.risk_level === "High").length;
  const avgGPA = count
    ? filteredData.reduce((sum, row) => sum + Number(row.gpa), 0) / count
    : 0;

  document.getElementById("studentCount").textContent = count.toLocaleString();
  document.getElementById("retentionRate").textContent =
    count ? `${(retained / count * 100).toFixed(1)}%` : "—";
  document.getElementById("graduationRate").textContent =
    count ? `${(graduated / count * 100).toFixed(1)}%` : "—";
  document.getElementById("averageGPA").textContent =
    count ? avgGPA.toFixed(2) : "—";
  document.getElementById("highRiskRate").textContent =
    count ? `${(highRisk / count * 100).toFixed(1)}%` : "—";
}

function updateTrendChart() {
  const data = getFilteredData("trend");
  const years = uniqueValues(data, "year");

  const counts = years.map(year =>
    data.filter(row => row.year === year).length
  );

  const retentionRates = years.map(year => {
    const subset = data.filter(row => row.year === year);
    const retained = subset.filter(row => row.retained === "Yes").length;
    return subset.length ? retained / subset.length * 100 : 0;
  });

  Plotly.react("trendChart", [
    {
      x: years,
      y: counts,
      type: "bar",
      name: "Students",
      marker: { color: colors.blue },
      hovertemplate: "Year %{x}<br>Students: %{y:,}<extra></extra>"
    },
    {
      x: years,
      y: retentionRates,
      type: "scatter",
      mode: "lines+markers",
      name: "Retention",
      yaxis: "y2",
      line: { color: colors.green, width: 3 },
      marker: { size: 8 },
      hovertemplate: "Year %{x}<br>Retention: %{y:.1f}%<extra></extra>"
    }
  ], {
    margin: { t: 15, r: 60, b: 55, l: 60 },
    xaxis: { title: "Academic year" },
    yaxis: { title: "Students", rangemode: "tozero" },
    yaxis2: {
      title: "Retention rate",
      overlaying: "y",
      side: "right",
      ticksuffix: "%",
      range: [0, 100]
    },
    legend: { orientation: "h", y: 1.12 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  }, plotConfig).then(() => {
    const plot = document.getElementById("trendChart");
    resetPlotListeners(plot, ["plotly_click"]);

    plot.on("plotly_click", eventData => {
      const year = eventData.points?.[0]?.x;
      if (year === undefined) return;
      plotState.trendYear = String(year);
      updateDashboard();
    });
  });
}

function updateDepartmentChart() {
  const data = getFilteredData("department");
  const departments = uniqueValues(data, "department");
  const types = uniqueValues(data, "student_type");
  const palette = [colors.blue, colors.navy, colors.purple];

  const traces = types.map((studentType, index) => ({
    x: departments,
    y: departments.map(department =>
      data.filter(row =>
        row.department === department &&
        row.student_type === studentType
      ).length
    ),
    type: "bar",
    name: studentType,
    marker: { color: palette[index % palette.length] },
    hovertemplate: `%{x}<br>${studentType}: %{y:,}<extra></extra>`
  }));

  Plotly.react("departmentChart", traces, {
    barmode: "stack",
    margin: { t: 15, r: 15, b: 95, l: 55 },
    xaxis: { tickangle: -25 },
    yaxis: { title: "Students" },
    legend: { orientation: "h", y: 1.13 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  }, plotConfig).then(() => {
    const plot = document.getElementById("departmentChart");
    resetPlotListeners(plot, ["plotly_click"]);

    plot.on("plotly_click", eventData => {
      const department = eventData.points?.[0]?.x;
      if (!department) return;
      plotState.department = department;
      updateDashboard();
    });
  });
}

function updateRiskChart() {
  const data = getFilteredData("risk");
  const levels = ["Low", "Medium", "High"];
  const values = levels.map(level =>
    data.filter(row => row.risk_level === level).length
  );

  Plotly.react("riskChart", [{
    labels: levels,
    values,
    type: "pie",
    hole: .58,
    marker: { colors: [colors.green, colors.orange, colors.red] },
    pull: levels.map(level => plotState.risk === level ? 0.08 : 0),
    textinfo: "percent",
    hovertemplate: "%{label}<br>Students: %{value:,}<br>%{percent}<extra></extra>"
  }], {
    margin: { t: 20, r: 20, b: 30, l: 20 },
    showlegend: true,
    legend: { orientation: "h", y: -.1 },
    paper_bgcolor: "rgba(0,0,0,0)"
  }, plotConfig).then(() => {
    const plot = document.getElementById("riskChart");
    resetPlotListeners(plot, ["plotly_click"]);

    plot.on("plotly_click", eventData => {
      const risk = eventData.points?.[0]?.label;
      if (!risk) return;
      plotState.risk = risk;
      updateDashboard();
    });
  });
}

function updateScatterChart() {
  const data = getFilteredData("scatter");

  const makeTrace = (rows, label, color) => ({
    x: rows.map(row => Number(row.attendance_rate)),
    y: rows.map(row => Number(row.gpa)),
    customdata: rows.map(row => [
      row.student_id,
      row.department,
      row.program,
      row.advising_visits,
      row.engagement_score,
      row.credits_completed
    ]),
    mode: "markers",
    type: "scattergl",
    name: `${label} risk`,
    marker: {
      size: rows.map(row => 6 + Number(row.advising_visits) * 1.35),
      color,
      opacity: 0.68
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

  const groups = {
    Low: data.filter(row => row.risk_level === "Low"),
    Medium: data.filter(row => row.risk_level === "Medium"),
    High: data.filter(row => row.risk_level === "High")
  };

  Plotly.react("scatterChart", [
    makeTrace(groups.Low, "Low", colors.green),
    makeTrace(groups.Medium, "Medium", colors.orange),
    makeTrace(groups.High, "High", colors.red)
  ], {
    dragmode: "lasso",
    margin: { t: 15, r: 30, b: 60, l: 60 },
    xaxis: { title: "Attendance rate", ticksuffix: "%", range: [40, 101] },
    yaxis: { title: "GPA", range: [0.75, 4.05] },
    legend: { orientation: "h", y: 1.12 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  }, plotConfig).then(() => {
    const plot = document.getElementById("scatterChart");
    resetPlotListeners(plot, ["plotly_selected"]);

    plot.on("plotly_selected", eventData => {
      if (!eventData?.points?.length) return;

      plotState.scatterIds = new Set(
        eventData.points.map(point => point.customdata?.[0]).filter(Boolean)
      );

      selectedStudentIds = new Set(plotState.scatterIds);
      updateDashboard();
    });
  });
}

function updateHeatmapChart() {
  const data = getFilteredData("heatmap");
  const departments = uniqueValues(data, "department");
  const years = uniqueValues(data, "year");

  const z = departments.map(department =>
    years.map(year => {
      const subset = data.filter(row =>
        row.department === department &&
        row.year === year
      );

      if (!subset.length) return null;

      const retained = subset.filter(row => row.retained === "Yes").length;
      return retained / subset.length * 100;
    })
  );

  Plotly.react("heatmapChart", [{
    type: "heatmap",
    x: years,
    y: departments,
    z,
    zmin: 40,
    zmax: 100,
    colorscale: [[0, "#d98686"], [.5, "#efcf8c"], [1, "#8abb7c"]],
    colorbar: { title: "Retention %" },
    hovertemplate: "<b>%{y}</b><br>Year: %{x}<br>Retention: %{z:.1f}%<extra></extra>"
  }], {
    margin: { t: 20, r: 90, b: 55, l: 150 },
    xaxis: { title: "Academic year" },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  }, plotConfig).then(() => {
    const plot = document.getElementById("heatmapChart");
    resetPlotListeners(plot, ["plotly_click"]);

    plot.on("plotly_click", eventData => {
      const point = eventData.points?.[0];
      if (!point) return;

      plotState.heatmapYear = String(point.x);
      plotState.heatmapDepartment = point.y;
      updateDashboard();
    });
  });
}

function updateBoxChart() {
  const data = getFilteredData("box");
  const departments = uniqueValues(data, "department");
  const palette = [colors.blue, colors.green, colors.orange, colors.purple, colors.navy];

  const traces = departments.map((department, index) => {
    const subset = data.filter(row => row.department === department);

    return {
      y: subset.map(row => Number(row.gpa)),
      type: "box",
      name: department,
      boxpoints: "outliers",
      jitter: .3,
      pointpos: 0,
      marker: { color: palette[index % palette.length] },
      hovertemplate: "GPA %{y:.2f}<extra>" + department + "</extra>"
    };
  });

  Plotly.react("boxChart", traces, {
    margin: { t: 20, r: 20, b: 100, l: 55 },
    yaxis: { title: "GPA", range: [.75, 4.05] },
    xaxis: { tickangle: -25 },
    showlegend: false,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)"
  }, plotConfig).then(() => {
    const plot = document.getElementById("boxChart");
    resetPlotListeners(plot, ["plotly_click"]);

    plot.on("plotly_click", eventData => {
      const department = eventData.points?.[0]?.data?.name;
      if (!department) return;

      plotState.boxDepartment = department;
      updateDashboard();
    });
  });
}

function updateSankeyChart() {
  const data = getFilteredData("sankey");
  const riskLevels = ["Low", "Medium", "High"];
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

  riskLevels.forEach((risk, index) => {
    const subset = data.filter(row => row.risk_level === risk);
    const retained = subset.filter(row => row.retained === "Yes").length;

    sources.push(index, index);
    targets.push(3, 4);
    values.push(retained, subset.length - retained);
  });

  const retainedStudents = data.filter(row => row.retained === "Yes");
  const nonRetainedStudents = data.filter(row => row.retained !== "Yes");
  const retainedGraduated = retainedStudents.filter(row => row.graduated === "Yes").length;
  const nonRetainedGraduated = nonRetainedStudents.filter(row => row.graduated === "Yes").length;

  sources.push(3, 3, 4, 4);
  targets.push(5, 6, 5, 6);
  values.push(
    retainedGraduated,
    retainedStudents.length - retainedGraduated,
    nonRetainedGraduated,
    nonRetainedStudents.length - nonRetainedGraduated
  );

  Plotly.react("sankeyChart", [{
    type: "sankey",
    orientation: "h",
    node: {
      pad: 18,
      thickness: 18,
      label: labels,
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
      source: sources,
      target: targets,
      value: values
    }
  }], {
    margin: { t: 20, r: 20, b: 20, l: 20 },
    paper_bgcolor: "rgba(0,0,0,0)",
    font: { size: 12 }
  }, plotConfig).then(() => {
    const plot = document.getElementById("sankeyChart");
    resetPlotListeners(plot, ["plotly_click"]);

    plot.on("plotly_click", eventData => {
      const label = eventData.points?.[0]?.label;
      if (!label) return;

      if (label === "Retained") plotState.sankeyRetained = "Yes";
      else if (label === "Not retained") plotState.sankeyRetained = "No";
      else if (label === "Graduated") plotState.sankeyGraduated = "Yes";
      else if (label === "Not graduated") plotState.sankeyGraduated = "No";
      else return;

      updateDashboard();
    });
  });
}

function buildTableHeader() {
  const row = document.getElementById("studentTableHeader");
  row.innerHTML = "";

  columns.forEach(([field, label]) => {
    const th = document.createElement("th");
    const button = document.createElement("button");

    button.type = "button";
    button.className = "sort-button";
    button.dataset.field = field;
    button.innerHTML = `${label}<span class="sort-indicator"></span>`;

    button.addEventListener("click", () => {
      if (tableState.sortField === field) {
        tableState.sortDirection =
          tableState.sortDirection === "asc" ? "desc" : "asc";
      } else {
        tableState.sortField = field;
        tableState.sortDirection = "asc";
      }

      updateStudentTable();
    });

    th.appendChild(button);
    row.appendChild(th);
  });
}

function updateStudentTable() {
  const tbody = document.querySelector("#studentTable tbody");
  tbody.innerHTML = "";

  const sorted = [...filteredData].sort((a, b) =>
    compareValues(
      a[tableState.sortField],
      b[tableState.sortField],
      tableState.sortDirection
    )
  );

  const rows = sorted.slice(0, 250);
  const numericRanges = getNumericRanges(filteredData);

  updateSortIndicators();

  rows.forEach(row => {
    const tr = document.createElement("tr");

    columns.forEach(([field]) => {
      const td = document.createElement("td");
      const value = row[field];

      td.textContent = formatCell(field, value);

      if (numericFields.has(field) && Number.isFinite(Number(value))) {
        td.style.background = numericColor(
          Number(value),
          numericRanges[field]
        );
      }

      if (field === "risk_level") {
        td.classList.add(`risk-${String(value).toLowerCase()}`);
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  document.getElementById("tableCount").textContent =
    `${rows.length.toLocaleString()} shown of ${filteredData.length.toLocaleString()}`;
}

function updateSortIndicators() {
  document.querySelectorAll(".sort-button").forEach(button => {
    const indicator = button.querySelector(".sort-indicator");

    if (button.dataset.field === tableState.sortField) {
      indicator.textContent =
        tableState.sortDirection === "asc" ? " ▲" : " ▼";
    } else {
      indicator.textContent = "";
    }
  });
}

function compareValues(a, b, direction) {
  const factor = direction === "asc" ? 1 : -1;
  const aNum = Number(a);
  const bNum = Number(b);

  if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
    return (aNum - bNum) * factor;
  }

  return String(a ?? "").localeCompare(String(b ?? "")) * factor;
}

function getNumericRanges(data) {
  const ranges = {};

  numericFields.forEach(field => {
    const values = data
      .map(row => Number(row[field]))
      .filter(Number.isFinite);

    ranges[field] = values.length
      ? { min: Math.min(...values), max: Math.max(...values) }
      : { min: 0, max: 1 };
  });

  return ranges;
}

function numericColor(value, range) {
  const span = range.max - range.min || 1;
  const t = Math.max(0, Math.min(1, (value - range.min) / span));
  const hue = 210 - t * 120;
  const lightness = 96 - t * 14;
  return `hsl(${hue} 55% ${lightness}%)`;
}

function formatCell(field, value) {
  if (value === null || value === undefined || value === "") return "";

  if (field === "gpa") return Number(value).toFixed(2);

  if (
    field === "attendance_rate" ||
    field === "completion_rate" ||
    field === "engagement_score"
  ) {
    return Number(value).toFixed(1);
  }

  if (
    field === "retention_probability" ||
    field === "graduation_probability"
  ) {
    return `${(Number(value) * 100).toFixed(1)}%`;
  }

  if (field === "unmet_financial_need") {
    return `$${Number(value).toLocaleString()}`;
  }

  return String(value);
}

function resetPlotListeners(plot, events) {
  if (!plot || !plot.removeAllListeners) return;
  events.forEach(eventName => plot.removeAllListeners(eventName));
}
