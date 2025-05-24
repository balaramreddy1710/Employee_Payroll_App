$(document).ready(function () {
  const apiUrl = "http://localhost:3000/employees";

  function fetchEmployees() {
    $.get(apiUrl, function (data) {
      displayEmployees(data);
    });
  }

  function displayEmployees(data) {
    const list = $("#employee-list");
    list.empty();
    data.forEach((emp) => {
      list.append(`
        <tr>
          <td>${emp.id}</td>
          <td>${emp.name}</td>
          <td>${emp.email}</td>
          <td>${emp.address || "-"}</td>
          <td>₹${emp.salary}</td>
          <td>${emp.department}</td>
          <td class="btn-con">
            <button class="btn" onclick="editEmployee(${emp.id})">Edit</button>
            <button class="btn" onclick="deleteEmployee(${
              emp.id
            })">Delete</button>
          </td>
        </tr>`);
    });
  }

  function generateRandomId() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  function showError(inputId, message) {
    const input = $(`#${inputId}`);
    input.addClass("error");
    if (!input.next(".error-msg").length) {
      input.after(`<div class="error-msg">${message}</div>`);
    } else {
      input.next(".error-msg").text(message);
    }
  }

  function clearErrors() {
    $(".error").removeClass("error");
    $(".error-msg").remove();
  }

  $("#payroll-form").on("submit", function (e) {
    e.preventDefault();
    clearErrors();

    const id = $("#edit-id").val() || generateRandomId();
    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const address = $("#address").val().trim();
    const salary = $("#salary").val().trim();
    const department = $("#department").val();

    const namePattern = /^[A-Z][a-z]{2,}(\s[A-Z][a-z]{2,})*$/;
    const emailPattern = /^\S+@\S+\.\S+$/;
    const salaryPattern = /^[1-9]\d{3,}$/;

    let hasError = false;

    if (!namePattern.test(name)) {
      showError("name", "Use capital initials. E.g., John Doe");
      hasError = true;
    }
    if (!emailPattern.test(email)) {
      showError("email", "Enter a valid email address");
      hasError = true;
    }
    if (address.length < 5) {
      showError("address", "Address should be at least 5 characters");
      hasError = true;
    }
    if (!salaryPattern.test(salary)) {
      showError("salary", "Enter salary greater than 1000");
      hasError = true;
    }
    if (!department || department === "Select Department") {
      showError("department", "Please select a department");
      hasError = true;
    }

    if (hasError) return;

    const employeeData = {
      id: Number(id),
      name,
      email,
      address,
      salary,
      department,
    };

    if ($("#edit-id").val()) {
      $.get(apiUrl + `?email=${email}`, function (existing) {
        const editingOwnRecord = existing.length === 1 && existing[0].id == id;
        if (existing.length > 0 && !editingOwnRecord) {
          showError("email", "Email already exists");
          return;
        }

        $.ajax({
          url: `${apiUrl}/${id}`,
          method: "PUT",
          contentType: "application/json",
          data: JSON.stringify(employeeData),
          success: () => {
            fetchEmployees();
            resetForm();
          },
        });
      });
    } else {
      $.get(apiUrl + `?email=${email}`, function (existing) {
        if (existing.length > 0) {
          showError("email", "Email already exists");
          return;
        }

        $.ajax({
          url: apiUrl,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(employeeData),
          success: () => {
            fetchEmployees();
            resetForm();
          },
        });
      });
    }
  });

  $("#search").on("input", function () {
    const term = $(this).val().toLowerCase();
    $.get(apiUrl, function (data) {
      const filtered = data.filter((emp) =>
        emp.name.toLowerCase().includes(term)
      );
      displayEmployees(filtered);
    });
  });

  $("#sort").on("change", function () {
    const field = $(this).val();
    $.get(apiUrl, function (data) {
      data.sort((a, b) => (a[field] > b[field] ? 1 : -1));
      displayEmployees(data);
    });
  });

  window.editEmployee = function (id) {
    $.get(`${apiUrl}/${id}`, function (data) {
      $("#edit-id").val(data.id);
      $("#name").val(data.name);
      $("#email").val(data.email);
      $("#address").val(data.address);
      $("#salary").val(data.salary);
      $("#department").val(data.department);
    });
  };

  window.deleteEmployee = function (id) {
    $.ajax({
      url: `${apiUrl}/${id}`,
      type: "DELETE",
      success: fetchEmployees,
    });
  };

  function resetForm() {
    $("#payroll-form")[0].reset();
    $("#edit-id").val("");
    clearErrors();
  }

  fetchEmployees();
});
