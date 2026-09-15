// Copyright (c) 2026, Sukku and contributors
// For license information, please see license.txt


// frappe.query_reports["SO vs PO REPORT"] = {

//     // ─────────────────────────────────────────────
//     // FILTERS  (mirrors Sales Order Analysis style)
//     // ─────────────────────────────────────────────
//     filters: [
//         {
//             fieldname: "company",
//             label: __("Company"),
//             fieldtype: "Link",
//             width: "80",
//             options: "Company",
//             reqd: 1,
//             default: frappe.defaults.get_default("company"),
//         },
//         {
//             fieldname: "from_date",
//             label: __("From Date"),
//             fieldtype: "Date",
//             width: "80",
//             reqd: 1,
//             default: frappe.datetime.add_months(frappe.datetime.get_today(), -1),
//             on_change: (report) => {
//                 report.set_filter_value("sales_order", []);
//                 report.set_filter_value("purchase_order", []);
//                 report.refresh();
//             },
//         },
//         {
//             fieldname: "to_date",
//             label: __("To Date"),
//             fieldtype: "Date",
//             width: "80",
//             reqd: 1,
//             default: frappe.datetime.get_today(),
//             on_change: (report) => {
//                 report.set_filter_value("sales_order", []);
//                 report.set_filter_value("purchase_order", []);
//                 report.refresh();
//             },
//         },
//         {
//             // ✅ Same MultiSelectList pattern as Sales Order Analysis
//             fieldname: "sales_order",
//             label: __("Sales Order"),
//             fieldtype: "MultiSelectList",
//             width: "80",
//             options: "Sales Order",
//             get_data: function (txt) {
//                 let filters = { docstatus: 1 };

//                 const from_date = frappe.query_report.get_filter_value("from_date");
//                 const to_date   = frappe.query_report.get_filter_value("to_date");
//                 if (from_date && to_date) {
//                     filters["transaction_date"] = ["between", [from_date, to_date]];
//                 }

//                 return frappe.db.get_link_options("Sales Order", txt, filters);
//             },
//         },
//         {
//             // ✅ NEW: Purchase Order filter (additional, not in Sales Order Analysis)
//             fieldname: "purchase_order",
//             label: __("Purchase Order"),
//             fieldtype: "MultiSelectList",
//             width: "80",
//             options: "Purchase Order",
//             get_data: function (txt) {
//                 let filters = { docstatus: 1 };

//                 const from_date = frappe.query_report.get_filter_value("from_date");
//                 const to_date   = frappe.query_report.get_filter_value("to_date");
//                 if (from_date && to_date) {
//                     filters["transaction_date"] = ["between", [from_date, to_date]];
//                 }

//                 return frappe.db.get_link_options("Purchase Order", txt, filters);
//             },
//         },
//         {
//             // ✅ Same MultiSelectList pattern as Sales Order Analysis
//             fieldname: "status",
//             label: __("Status"),
//             fieldtype: "MultiSelectList",
//             width: "80",
//             get_data: function (txt) {
//                 let statuses = [
//                     "Draft",
//                     "On Hold",
//                     "To Deliver and Bill",
//                     "To Bill",
//                     "To Deliver",
//                     "Completed",
//                     "Cancelled",
//                     "Closed",
//                 ];
//                 return statuses.map((s) => ({ value: s, label: __(s), description: "" }));
//             },
//         },
//     ],


//     // ─────────────────────────────────────────────
//     // FORMATTER
//     // ─────────────────────────────────────────────
//     formatter: function (value, row, column, data, default_formatter) {

//         value = default_formatter(value, row, column, data);

//         // ✅ Bold totals row
//         if (data && data.is_total_row) {
//             if (column.fieldname === "customer_name") {
//                 return `<strong style="color:#333;">Totals</strong>`;
//             }
//             // Bold numeric/currency totals
//             let numeric_fields = [
//                 "qty", "amount", "qty_billed", "qty_pending",
//                 "amount_billed", "amount_pending", "po_qty"
//             ];
//             if (in_list(numeric_fields, column.fieldname) && data[column.fieldname] != null) {
//                 return `<strong>${value}</strong>`;
//             }
//             return value;
//         }

//         // ✅ CERTIFICATE SELECT — color-coded badge
//         if (column.fieldname === "custom_certificate") {

//             let val = data.custom_certificate || "";

//             let colorMap = {
//                 "TC":    "#5b7fff",
//                 "CC":    "#28a745",
//                 "TC/CC": "#fd7e14"
//             };

//             let color = colorMap[val] || "#aaa";

//             if (!val) {
//                 return `<span style="color:#aaa; font-style:italic;">—</span>`;
//             }

//             return `
//                 <span style="
//                     background:${color};
//                     color:#fff;
//                     padding:2px 8px;
//                     border-radius:4px;
//                     font-size:11px;
//                     font-weight:600;
//                     letter-spacing:0.4px;
//                 ">${val}</span>
//             `;
//         }

//         // ✅ CHECKBOX — In Transit
//         if (column.fieldname === "in_transit") {

//             let checked = data.in_transit ? "checked" : "";
//             let poi = data.poi_name || "";

//             if (!poi) {
//                 return `<input type="checkbox" ${checked} disabled>`;
//             }

//             return `
//                 <input type="checkbox" ${checked}
//                     onclick="so_vs_po_update_in_transit('${poi}', this.checked)">
//             `;
//         }

//         // ✅ EDITABLE AWB FIELD
//         if (column.fieldname === "awb_number") {

//             let val = (data.awb_number || "").replace(/"/g, "&quot;");
//             let poi = data.poi_name || "";

//             if (!poi) {
//                 return `<span>${val}</span>`;
//             }

//             return `
//                 <input type="text" value="${val}"
//                     style="width:150px; border:1px solid #d1d8dd; border-radius:4px; padding:2px 6px;"
//                     onchange="so_vs_po_update_awb('${poi}', this.value)">
//             `;
//         }

//         // ✅ EDITABLE REMARK FIELD
//         if (column.fieldname === "custom_remark") {

//             let val = (data.custom_remark || "").replace(/"/g, "&quot;");
//             let poi = data.poi_name || "";

//             if (!poi) {
//                 return `<span style="color:#aaa; font-style:italic;">${val || "—"}</span>`;
//             }

//             return `
//                 <input type="text" value="${val}"
//                     style="width:180px; border:1px solid #d1d8dd; border-radius:4px; padding:2px 6px;"
//                     placeholder="Add remark..."
//                     onchange="so_vs_po_update_remark('${poi}', this.value)">
//             `;
//         }

//         // ✅ Highlight amount_pending in red if > 0 (mirrors Sales Order Analysis pending_amount style)
//         if (column.fieldname === "amount_pending" && data && data.amount_pending > 0) {
//             return `<span style="color:red;">${value}</span>`;
//         }

//         // ✅ Highlight amount_billed in green if > 0
//         if (column.fieldname === "amount_billed" && data && data.amount_billed > 0) {
//             return `<span style="color:green;">${value}</span>`;
//         }

//         return value;
//     },
// };


// // ─────────────────────────────────────────────
// // WHITELISTED UPDATE HELPERS
// // Namespaced with "so_vs_po_" to avoid global collisions
// // ─────────────────────────────────────────────

// // ✅ UPDATE IN TRANSIT CHECKBOX
// window.so_vs_po_update_in_transit = function (poi_name, checked) {
//     frappe.call({
//         method: "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_in_transit",
//         args: {
//             poi_name: poi_name,
//             value: checked ? 1 : 0
//         },
//         callback: function () {
//             frappe.show_alert({ message: __("In Transit Updated"), indicator: "green" });
//         }
//     });
// };

// // ✅ UPDATE AWB NUMBER
// window.so_vs_po_update_awb = function (poi_name, value) {
//     frappe.call({
//         method: "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_awb_number",
//         args: {
//             poi_name: poi_name,
//             awb_number: value
//         },
//         callback: function () {
//             frappe.show_alert({ message: __("AWB Updated"), indicator: "green" });
//         }
//     });
// };

// // ✅ UPDATE REMARK
// window.so_vs_po_update_remark = function (poi_name, value) {
//     frappe.call({
//         method: "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_remark",
//         args: {
//             poi_name: poi_name,
//             remark: value
//         },
//         callback: function () {
//             frappe.show_alert({ message: __("Remark Updated"), indicator: "green" });
//         }
//     });
// };


// Copyright (c) 2024, Your Company
// SO vs PO Report — filters mirror Sales Order Analysis + Purchase Order filter

frappe.query_reports["SO VS PO Report"] = {

    // ─────────────────────────────────────────────
    // FILTERS  (mirrors Sales Order Analysis style)
    // ─────────────────────────────────────────────
    filters: [
        {
            fieldname: "company",
            label: __("Company"),
            fieldtype: "Link",
            width: "80",
            options: "Company",
            reqd: 1,
            default: frappe.defaults.get_default("company"),
        },
        {
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date",
            width: "80",
            reqd: 1,
            default: frappe.datetime.add_months(frappe.datetime.get_today(), -1),
            on_change: (report) => {
                report.set_filter_value("sales_order", []);
                report.set_filter_value("purchase_order", []);
                report.refresh();
            },
        },
        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date",
            width: "80",
            reqd: 1,
            default: frappe.datetime.get_today(),
            on_change: (report) => {
                report.set_filter_value("sales_order", []);
                report.set_filter_value("purchase_order", []);
                report.refresh();
            },
        },
        {
            // ✅ Same MultiSelectList pattern as Sales Order Analysis
            fieldname: "sales_order",
            label: __("Sales Order"),
            fieldtype: "MultiSelectList",
            width: "80",
            options: "Sales Order",
            get_data: function (txt) {
                let filters = { docstatus: 1 };

                const from_date = frappe.query_report.get_filter_value("from_date");
                const to_date   = frappe.query_report.get_filter_value("to_date");
                if (from_date && to_date) {
                    filters["transaction_date"] = ["between", [from_date, to_date]];
                }

                return frappe.db.get_link_options("Sales Order", txt, filters);
            },
        },
        {
            // ✅ Purchase Order filter
            fieldname: "purchase_order",
            label: __("Purchase Order"),
            fieldtype: "MultiSelectList",
            width: "80",
            options: "Purchase Order",
            get_data: function (txt) {
                let filters = { docstatus: 1 };

                const from_date = frappe.query_report.get_filter_value("from_date");
                const to_date   = frappe.query_report.get_filter_value("to_date");
                if (from_date && to_date) {
                    filters["transaction_date"] = ["between", [from_date, to_date]];
                }

                return frappe.db.get_link_options("Purchase Order", txt, filters);
            },
        },
        {
            // ✅ Same MultiSelectList pattern as Sales Order Analysis
            fieldname: "status",
            label: __("Status"),
            fieldtype: "MultiSelectList",
            width: "80",
            get_data: function (txt) {
                let statuses = [
                    "Draft",
                    "On Hold",
                    "To Deliver and Bill",
                    "To Bill",
                    "To Deliver",
                    "Completed",
                    "Cancelled",
                    "Closed",
                ];
                return statuses.map((s) => ({ value: s, label: __(s), description: "" }));
            },
        },
    ],


    // ─────────────────────────────────────────────
    // ✅ FIX: Force client-side inline column filtering
    // Prevents Frappe DataTable from doing server-side
    // link lookups that return only the first match
    // ─────────────────────────────────────────────
    get_datatable_options: function (options) {
        return Object.assign(options, {
            inlineFilters: true,
        });
    },


    // ─────────────────────────────────────────────
    // FORMATTER
    // ─────────────────────────────────────────────
    formatter: function (value, row, column, data, default_formatter) {

        value = default_formatter(value, row, column, data);

        // ✅ Bold totals row
        if (data && data.is_total_row) {
            if (column.fieldname === "customer_name") {
                return `<strong style="color:#333;">Totals</strong>`;
            }
            // Bold numeric/currency totals
            let numeric_fields = [
                "qty", "amount", "qty_billed", "qty_pending",
                "amount_billed", "amount_pending", "po_qty"
            ];
            if (in_list(numeric_fields, column.fieldname) && data[column.fieldname] != null) {
                return `<strong>${value}</strong>`;
            }
            return value;
        }

        // ✅ CERTIFICATE SELECT — color-coded badge
        if (column.fieldname === "custom_certificate") {

            let val = data.custom_certificate || "";

            let colorMap = {
                "TC":    "#5b7fff",
                "CC":    "#28a745",
                "TC/CC": "#fd7e14"
            };

            let color = colorMap[val] || "#aaa";

            if (!val) {
                return `<span style="color:#aaa; font-style:italic;">—</span>`;
            }

            return `
                <span style="
                    background:${color};
                    color:#fff;
                    padding:2px 8px;
                    border-radius:4px;
                    font-size:11px;
                    font-weight:600;
                    letter-spacing:0.4px;
                ">${val}</span>
            `;
        }

        // ✅ CHECKBOX — In Transit
        if (column.fieldname === "in_transit") {

            let checked = data.in_transit ? "checked" : "";
            let poi = data.poi_name || "";

            if (!poi) {
                return `<input type="checkbox" ${checked} disabled>`;
            }

            return `
                <input type="checkbox" ${checked}
                    onclick="so_vs_po_update_in_transit('${poi}', this.checked)">
            `;
        }

        // ✅ EDITABLE AWB FIELD
        if (column.fieldname === "awb_number") {

            let val = (data.awb_number || "").replace(/"/g, "&quot;");
            let poi = data.poi_name || "";

            if (!poi) {
                return `<span>${val}</span>`;
            }

            return `
                <input type="text" value="${val}"
                    style="width:150px; border:1px solid #d1d8dd; border-radius:4px; padding:2px 6px;"
                    onchange="so_vs_po_update_awb('${poi}', this.value)">
            `;
        }

        // ✅ EDITABLE REMARK FIELD
        if (column.fieldname === "custom_remark") {

            let val = (data.custom_remark || "").replace(/"/g, "&quot;");
            let poi = data.poi_name || "";

            if (!poi) {
                return `<span style="color:#aaa; font-style:italic;">${val || "—"}</span>`;
            }

            return `
                <input type="text" value="${val}"
                    style="width:180px; border:1px solid #d1d8dd; border-radius:4px; padding:2px 6px;"
                    placeholder="Add remark..."
                    onchange="so_vs_po_update_remark('${poi}', this.value)">
            `;
        }

        // ✅ Highlight amount_pending in red if > 0
        if (column.fieldname === "amount_pending" && data && data.amount_pending > 0) {
            return `<span style="color:red;">${value}</span>`;
        }

        // ✅ Highlight amount_billed in green if > 0
        if (column.fieldname === "amount_billed" && data && data.amount_billed > 0) {
            return `<span style="color:green;">${value}</span>`;
        }

        return value;
    },
};


// ─────────────────────────────────────────────
// WHITELISTED UPDATE HELPERS
// ─────────────────────────────────────────────

window.so_vs_po_update_in_transit = function (poi_name, checked) {
    frappe.call({
        method: "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_in_transit",
        args: {
            poi_name: poi_name,
            value: checked ? 1 : 0
        },
        callback: function () {
            frappe.show_alert({ message: __("In Transit Updated"), indicator: "green" });
        }
    });
};

window.so_vs_po_update_awb = function (poi_name, value) {
    frappe.call({
        method: "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_awb_number",
        args: {
            poi_name: poi_name,
            awb_number: value
        },
        callback: function () {
            frappe.show_alert({ message: __("AWB Updated"), indicator: "green" });
        }
    });
};

window.so_vs_po_update_remark = function (poi_name, value) {
    frappe.call({
        method: "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_remark",
        args: {
            poi_name: poi_name,
            remark: value
        },
        callback: function () {
            frappe.show_alert({ message: __("Remark Updated"), indicator: "green" });
        }
    });
};