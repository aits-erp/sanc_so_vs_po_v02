// Copyright (c) 2026, Sukku and contributors
// For license information, please see license.txt


frappe.query_reports["SO VS PO Report"] = {

    // ============================================================
    // FILTERS
    // ============================================================

    filters: [

        // --------------------------------------------------------
        // COMPANY
        // --------------------------------------------------------

        {
            fieldname: "company",
            label: __("Company"),
            fieldtype: "Link",
            width: "80",
            options: "Company",
            reqd: 1,
            default: frappe.defaults.get_default("company"),
        },


        // --------------------------------------------------------
        // FROM DATE
        // --------------------------------------------------------

        {
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date",
            width: "80",
            reqd: 1,
            default: frappe.datetime.add_months(
                frappe.datetime.get_today(),
                -1
            ),

            on_change: function (report) {

                report.set_filter_value(
                    "sales_order",
                    []
                );

                report.set_filter_value(
                    "purchase_order",
                    []
                );

                report.refresh();
            },
        },


        // --------------------------------------------------------
        // TO DATE
        // --------------------------------------------------------

        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date",
            width: "80",
            reqd: 1,
            default: frappe.datetime.get_today(),

            on_change: function (report) {

                report.set_filter_value(
                    "sales_order",
                    []
                );

                report.set_filter_value(
                    "purchase_order",
                    []
                );

                report.refresh();
            },
        },


        // --------------------------------------------------------
        // SALES ORDER
        // --------------------------------------------------------

        {
            fieldname: "sales_order",
            label: __("Sales Order"),
            fieldtype: "MultiSelectList",
            width: "80",
            options: "Sales Order",

            get_data: function (txt) {

                let filters = {
                    docstatus: 1
                };

                const from_date =
                    frappe.query_report.get_filter_value(
                        "from_date"
                    );

                const to_date =
                    frappe.query_report.get_filter_value(
                        "to_date"
                    );

                if (from_date && to_date) {

                    filters["transaction_date"] = [
                        "between",
                        [
                            from_date,
                            to_date
                        ]
                    ];
                }

                return frappe.db.get_link_options(
                    "Sales Order",
                    txt,
                    filters
                );
            },
        },


        // --------------------------------------------------------
        // PURCHASE ORDER
        // --------------------------------------------------------

        {
            fieldname: "purchase_order",
            label: __("Purchase Order"),
            fieldtype: "MultiSelectList",
            width: "80",
            options: "Purchase Order",

            get_data: function (txt) {

                let filters = {
                    docstatus: 1
                };

                const from_date =
                    frappe.query_report.get_filter_value(
                        "from_date"
                    );

                const to_date =
                    frappe.query_report.get_filter_value(
                        "to_date"
                    );

                if (from_date && to_date) {

                    filters["transaction_date"] = [
                        "between",
                        [
                            from_date,
                            to_date
                        ]
                    ];
                }

                return frappe.db.get_link_options(
                    "Purchase Order",
                    txt,
                    filters
                );
            },
        },


        // --------------------------------------------------------
        // STATUS
        // --------------------------------------------------------

        {
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

                return statuses.map(function (status) {

                    return {
                        value: status,
                        label: __(status),
                        description: ""
                    };

                });
            },
        },

    ],


    // ============================================================
    // IMPORTANT
    // ============================================================
    //
    // DO NOT add:
    //
    // get_datatable_options: function (options) {
    //     return Object.assign(options, {
    //         inlineFilters: true,
    //     });
    // },
    //
    // inlineFilters: true creates the unwanted second row of
    // filter boxes below the column headers.
    //
    // ============================================================


    // ============================================================
    // FORMATTER
    // ============================================================

    formatter: function (
        value,
        row,
        column,
        data,
        default_formatter
    ) {

        // --------------------------------------------------------
        // FIRST: Let Frappe format the normal value
        // --------------------------------------------------------

        value = default_formatter(
            value,
            row,
            column,
            data
        );


        // --------------------------------------------------------
        // CRITICAL FIX
        // --------------------------------------------------------
        //
        // Frappe DataTable can call formatter() for footer or
        // other rows where `data` is undefined.
        //
        // Previously:
        //
        //     data.custom_certificate
        //
        // caused:
        //
        //     Cannot read properties of undefined
        //
        // --------------------------------------------------------

        if (!data) {
            return value;
        }


        // ========================================================
        // TOTAL ROW
        // ========================================================

        if (data.is_total_row) {

            // Total label
            if (
                column.fieldname === "customer_name"
            ) {

                return `
                    <strong style="color:#333;">
                        Totals
                    </strong>
                `;
            }


            // Numeric fields
            let numeric_fields = [
                "qty",
                "amount",
                "qty_billed",
                "qty_pending",
                "amount_billed",
                "amount_pending",
                "po_qty"
            ];


            if (
                in_list(
                    numeric_fields,
                    column.fieldname
                )
                &&
                data[column.fieldname] != null
            ) {

                return `
                    <strong>
                        ${value}
                    </strong>
                `;
            }


            return value;
        }


        // ========================================================
        // CERTIFICATE
        // ========================================================

        if (
            column.fieldname === "custom_certificate"
        ) {

            let val =
                data.custom_certificate || "";


            let colorMap = {

                "TC": "#5b7fff",

                "CC": "#28a745",

                "TC/CC": "#fd7e14"
            };


            let color =
                colorMap[val] || "#aaa";


            // No certificate
            if (!val) {

                return `
                    <span
                        style="
                            color:#aaa;
                            font-style:italic;
                        "
                    >
                        —
                    </span>
                `;
            }


            // Certificate badge
            return `
                <span
                    style="
                        background:${color};
                        color:#fff;
                        padding:2px 8px;
                        border-radius:4px;
                        font-size:11px;
                        font-weight:600;
                        letter-spacing:0.4px;
                    "
                >
                    ${val}
                </span>
            `;
        }


        // ========================================================
        // IN TRANSIT
        // ========================================================

        if (
            column.fieldname === "in_transit"
        ) {

            let checked =
                data.in_transit
                    ? "checked"
                    : "";


            let poi =
                data.poi_name || "";


            // No Purchase Order Item
            if (!poi) {

                return `
                    <input
                        type="checkbox"
                        ${checked}
                        disabled
                    >
                `;
            }


            // Editable checkbox
            return `
                <input
                    type="checkbox"
                    ${checked}
                    onclick="
                        so_vs_po_update_in_transit(
                            '${poi}',
                            this.checked
                        )
                    "
                >
            `;
        }


        // ========================================================
        // AWB / MAWB NUMBER
        // ========================================================

        if (
            column.fieldname === "awb_number"
        ) {

            let val =
                (
                    data.awb_number || ""
                ).replace(
                    /"/g,
                    "&quot;"
                );


            let poi =
                data.poi_name || "";


            // No Purchase Order Item
            if (!poi) {

                return `
                    <span>
                        ${val}
                    </span>
                `;
            }


            // Editable AWB field
            return `
                <input
                    type="text"
                    value="${val}"

                    style="
                        width:150px;
                        border:1px solid #d1d8dd;
                        border-radius:4px;
                        padding:2px 6px;
                    "

                    onchange="
                        so_vs_po_update_awb(
                            '${poi}',
                            this.value
                        )
                    "
                >
            `;
        }


        // ========================================================
        // REMARK
        // ========================================================

        if (
            column.fieldname === "custom_remark"
        ) {

            let val =
                (
                    data.custom_remark || ""
                ).replace(
                    /"/g,
                    "&quot;"
                );


            let poi =
                data.poi_name || "";


            // No Purchase Order Item
            if (!poi) {

                return `
                    <span
                        style="
                            color:#aaa;
                            font-style:italic;
                        "
                    >
                        ${val || "—"}
                    </span>
                `;
            }


            // Editable Remark field
            return `
                <input
                    type="text"
                    value="${val}"

                    style="
                        width:180px;
                        border:1px solid #d1d8dd;
                        border-radius:4px;
                        padding:2px 6px;
                    "

                    placeholder="Add remark..."

                    onchange="
                        so_vs_po_update_remark(
                            '${poi}',
                            this.value
                        )
                    "
                >
            `;
        }


        // ========================================================
        // AMOUNT PENDING
        // ========================================================

        if (
            column.fieldname === "amount_pending"
            &&
            data.amount_pending > 0
        ) {

            return `
                <span style="color:red;">
                    ${value}
                </span>
            `;
        }


        // ========================================================
        // AMOUNT BILLED
        // ========================================================

        if (
            column.fieldname === "amount_billed"
            &&
            data.amount_billed > 0
        ) {

            return `
                <span style="color:green;">
                    ${value}
                </span>
            `;
        }


        // ========================================================
        // DEFAULT
        // ========================================================

        return value;
    },
};


// ================================================================
// UPDATE IN TRANSIT
// ================================================================

window.so_vs_po_update_in_transit = function (
    poi_name,
    checked
) {

    frappe.call({

        method:
            "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_in_transit",

        args: {

            poi_name: poi_name,

            value: checked ? 1 : 0
        },

        callback: function () {

            frappe.show_alert({

                message: __(
                    "In Transit Updated"
                ),

                indicator: "green"
            });

        }
    });
};


// ================================================================
// UPDATE AWB NUMBER
// ================================================================

window.so_vs_po_update_awb = function (
    poi_name,
    value
) {

    frappe.call({

        method:
            "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_awb_number",

        args: {

            poi_name: poi_name,

            awb_number: value
        },

        callback: function () {

            frappe.show_alert({

                message: __(
                    "AWB Updated"
                ),

                indicator: "green"
            });

        }
    });
};


// ================================================================
// UPDATE REMARK
// ================================================================

window.so_vs_po_update_remark = function (
    poi_name,
    value
) {

    frappe.call({

        method:
            "sanc_report.sanc_report.report.so_vs_po_report.so_vs_po_report.update_remark",

        args: {

            poi_name: poi_name,

            remark: value
        },

        callback: function () {

            frappe.show_alert({

                message: __(
                    "Remark Updated"
                ),

                indicator: "green"
            });

        }
    });
};