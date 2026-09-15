# def execute(filters=None):
#     columns = get_columns()
#     data = get_data(filters)

#     report_summary = []

#     if data:
#         totals = get_totals_row(data)

#         currency = None
#         if filters and filters.get("company"):
#             currency = frappe.get_cached_value("Company", filters.get("company"), "default_currency")

#         report_summary = [
#             {
#                 "label": "Total Qty",
#                 "value": totals["qty"],
#                 "indicator": "Blue",
#                 "datatype": "Float",
#             },
#             {
#                 "label": "Total Amount",
#                 "value": totals["amount"],
#                 "indicator": "Blue",
#                 "datatype": "Currency",
#                 "currency": currency,
#             },
#             {
#                 "label": "Delivered Qty",
#                 "value": totals["qty_billed"],
#                 "indicator": "Green",
#                 "datatype": "Float",
#             },
#             {
#                 "label": "Qty Pending",
#                 "value": totals["qty_pending"],
#                 "indicator": "Orange",
#                 "datatype": "Float",
#             },
#             {
#                 "label": "Amount Billed",
#                 "value": totals["amount_billed"],
#                 "indicator": "Green",
#                 "datatype": "Currency",
#                 "currency": currency,
#             },
#             {
#                 "label": "Amount Pending",
#                 "value": totals["amount_pending"],
#                 "indicator": "Red",
#                 "datatype": "Currency",
#                 "currency": currency,
#             },
#             {
#                 "label": "PO Qty",
#                 "value": totals["po_qty"],
#                 "indicator": "Blue",
#                 "datatype": "Float",
#             },
#         ]

#         # ✅ Append totals row at the bottom of the data table
#         data.append(totals)

#     return columns, data, None, None, report_summary



# def get_columns():
#     return [
#         {"label": "Date",                "fieldname": "date",                   "fieldtype": "Date",     "width": 100},
#         {"label": "Customer PO Number",  "fieldname": "po_no",                  "fieldtype": "Data",     "width": 150},
#         {"label": "SO Category",         "fieldname": "order_type",             "fieldtype": "Data",     "width": 140},
#         {"label": "Sales Order",         "fieldname": "so",                     "fieldtype": "Link",     "options": "Sales Order",  "width": 150},
#         {"label": "Sales Person",        "fieldname": "sales_person",           "fieldtype": "Data",     "width": 150},
#         {"label": "Customer Name",       "fieldname": "customer_name",          "fieldtype": "Data",     "width": 180},
#         {"label": "Certificate",         "fieldname": "custom_certificate",     "fieldtype": "Select",   "options": "\nTC\nCC\nTC/CC", "width": 120},
#         {"label": "Part Number",         "fieldname": "item_code",              "fieldtype": "Link",     "options": "Item",         "width": 120},
#         {"label": "Qty",                 "fieldname": "qty",                    "fieldtype": "Float",    "width": 80},
#         {"label": "Unit Price",          "fieldname": "rate",                   "fieldtype": "Currency", "width": 100},
#         {"label": "Total Price",         "fieldname": "amount",                 "fieldtype": "Currency", "width": 120},
#         {"label": "Sales EDD",           "fieldname": "custom_edd",             "fieldtype": "Date",     "width": 120},

#         # ── Billed / Pending — same formula as Sales Order Analysis ──
#         {"label": "Qty Billed",          "fieldname": "qty_billed",             "fieldtype": "Float",    "width": 100},
#         {"label": "Qty Pending",         "fieldname": "qty_pending",            "fieldtype": "Float",    "width": 100},
#         {"label": "Amount Billed",       "fieldname": "amount_billed",          "fieldtype": "Currency", "width": 120},
#         {"label": "Amount Pending",      "fieldname": "amount_pending",         "fieldtype": "Currency", "width": 120},

#         {"label": "Supplier Code",       "fieldname": "supplier",               "fieldtype": "Link",     "options": "Supplier",     "width": 150},
#         {"label": "Supplier Name",       "fieldname": "supplier_name",          "fieldtype": "Data",     "width": 180},
#         {"label": "PO Number",           "fieldname": "po",                     "fieldtype": "Link",     "options": "Purchase Order","width": 150},
#         {"label": "PO Date",             "fieldname": "po_date",                "fieldtype": "Date",     "width": 100},
#         {"label": "PO Item",             "fieldname": "po_item",                "fieldtype": "Data",     "width": 120},
#         {"label": "PO Qty",              "fieldname": "po_qty",                 "fieldtype": "Float",    "width": 100},
#         {"label": "Purchase EDD",        "fieldname": "expected_delivery_date", "fieldtype": "Date",     "width": 120},
#         {"label": "In Transit",          "fieldname": "in_transit",             "fieldtype": "Check",    "width": 100},
#         {"label": "AWB/MAWB Number",     "fieldname": "awb_number",             "fieldtype": "Data",     "width": 180},
#         {"label": "Remark",              "fieldname": "custom_remark",          "fieldtype": "Data",     "width": 200},
#     ]


# def get_conditions(filters):
#     conditions = ""

#     if filters.get("from_date") and filters.get("to_date"):
#         conditions += " AND so.transaction_date BETWEEN %(from_date)s AND %(to_date)s"

#     if filters.get("company"):
#         conditions += " AND so.company = %(company)s"

#     if filters.get("sales_order") and len(filters.get("sales_order")) > 0:
#         conditions += " AND so.name IN %(sales_order)s"

#     if filters.get("status") and len(filters.get("status")) > 0:
#         conditions += " AND so.status IN %(status)s"
#     if filters.get("purchase_order") and len(filters.get("purchase_order")) > 0:
#         conditions += " AND po.name IN %(purchase_order)s"
#     return conditions


# def get_data(filters):
#     if not filters:
#         filters = {}

#     # Convert lists to tuples for SQL IN clause
#     for key in ("sales_order", "purchase_order", "status"):
#         if filters.get(key) and isinstance(filters[key], list):
#             filters[key] = tuple(filters[key])

#     conditions = get_conditions(filters)

#     data = frappe.db.sql("""
#         SELECT
#             so.transaction_date                                         AS date,
#             so.po_no,
#             so.order_type,
#             so.name                                                     AS so,
#             GROUP_CONCAT(DISTINCT st.sales_person SEPARATOR ', ')        AS sales_person,
#             so.customer_name,
#             so.custom_certificate,

#             soi.item_code,
#             soi.qty,
#             soi.rate,
#             soi.base_amount                                             AS amount,
#             soi.custom_edd,

#             IFNULL(soi.delivered_qty, 0) AS qty_billed,

#             (soi.qty - IFNULL(soi.delivered_qty, 0)) AS qty_pending,

#             (soi.billed_amt * IFNULL(so.conversion_rate, 1)) AS amount_billed,

#             (soi.base_amount - (soi.billed_amt * IFNULL(so.conversion_rate, 1))) AS amount_pending,

#             sup.name                                                    AS supplier,
#             sup.supplier_name,
#             po.name                                                     AS po,
#             po.transaction_date                                         AS po_date,

#             poi.item_code                                               AS po_item,
#             poi.qty                                                     AS po_qty,
#             poi.expected_delivery_date,
#             poi.custom_good_in_transit                                  AS in_transit,
#             poi.custom_awbmawb_number                                   AS awb_number,
#             poi.custom_remark,
#             poi.name                                                    AS poi_name

#         FROM `tabSales Order` so

#         -- ── Join SO items — same as standard report ──
#         INNER JOIN `tabSales Order Item` soi
#             ON soi.parent = so.name

#         -- ── Sales Team child table — to fetch Sales Person ──
#         LEFT JOIN `tabSales Team` st
#             ON st.parent      = so.name
#            AND st.parenttype  = 'Sales Order'

#         -- ── PO item matched by SO name + item code ──
#         LEFT JOIN `tabPurchase Order Item` poi
#              ON poi.sales_order = so.name
#             AND poi.sales_order_item = soi.name

#         -- ── PO header — only submitted ──
#         LEFT JOIN `tabPurchase Order` po
#             ON po.name      = poi.parent
#             AND po.docstatus = 1

#         LEFT JOIN `tabSupplier` sup
#             ON sup.name = po.supplier

#         -- ── SI items joined on so_detail (soi.name) — same as standard report ──
#         -- This avoids double-counting when multiple invoice lines exist
        
#        WHERE
#     so.docstatus = 1
#     AND so.status NOT IN ('Cancelled', 'Closed','Completed')
#     {conditions}

# GROUP BY soi.name

# ORDER BY so.transaction_date DESC, so.name, soi.idx

#     """.format(conditions=conditions), filters, as_dict=1)

#     return data


# def get_totals_row(data):
#     totals = {
#         "date":                   None,
#         "po_no":                  None,
#         "order_type":             None,
#         "so":                     None,
#         "sales_person":           None,
#         "customer_name":          "Total",
#         "custom_certificate":     None,
#         "item_code":              None,
#         "qty":                    0,
#         "rate":                   None,
#         "amount":                 0,
#         "custom_edd":             None,
#         "qty_billed":             0,
#         "qty_pending":            0,
#         "amount_billed":          0,
#         "amount_pending":         0,
#         "supplier":               None,
#         "supplier_name":          None,
#         "po":                     None,
#         "po_date":                None,
#         "po_item":                None,
#         "po_qty":                 0,
#         "expected_delivery_date": None,
#         "in_transit":             None,
#         "awb_number":             None,
#         "custom_remark":          None,
#         "poi_name":               None,
#         "is_total_row":           True,
#     }

#     for row in data:
#         totals["qty"]            += (row.get("qty")            or 0)
#         totals["amount"]         += (row.get("amount")         or 0)
#         totals["qty_billed"]     += (row.get("qty_billed")     or 0)
#         totals["qty_pending"]    += (row.get("qty_pending")    or 0)
#         totals["amount_billed"]  += (row.get("amount_billed")  or 0)
#         totals["amount_pending"] += (row.get("amount_pending") or 0)
#         totals["po_qty"]         += (row.get("po_qty")         or 0)

#     return totals


# # ── Whitelisted update helpers ─────────────────────────────────────────────────

# @frappe.whitelist()
# def update_in_transit(poi_name, value):
#     frappe.db.set_value("Purchase Order Item", poi_name, "custom_good_in_transit", value)
#     frappe.db.commit()


# @frappe.whitelist()
# def update_awb_number(poi_name, awb_number):
#     frappe.db.set_value("Purchase Order Item", poi_name, "custom_awbmawb_number", awb_number)
#     frappe.db.commit()

# # hi
# @frappe.whitelist()
# def update_remark(poi_name, remark):
#     frappe.db.set_value("Purchase Order Item", poi_name, "custom_remark", remark)
#     frappe.db.commit()

import frappe
def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)

    report_summary = []

    if data:
        totals = get_totals_row(data)

        currency = None
        if filters and filters.get("company"):
            currency = frappe.get_cached_value("Company", filters.get("company"), "default_currency")

        report_summary = [
            {
                "label": "Total Qty",
                "value": totals["qty"],
                "indicator": "Blue",
                "datatype": "Float",
            },
            {
                "label": "Total Amount",
                "value": totals["amount"],
                "indicator": "Blue",
                "datatype": "Currency",
                "currency": currency,
            },
            {
                "label": "Delivered Qty",
                "value": totals["qty_billed"],
                "indicator": "Green",
                "datatype": "Float",
            },
            {
                "label": "Qty Pending",
                "value": totals["qty_pending"],
                "indicator": "Orange",
                "datatype": "Float",
            },
            {
                "label": "Amount Billed",
                "value": totals["amount_billed"],
                "indicator": "Green",
                "datatype": "Currency",
                "currency": currency,
            },
            {
                "label": "Amount Pending",
                "value": totals["amount_pending"],
                "indicator": "Red",
                "datatype": "Currency",
                "currency": currency,
            },
            {
                "label": "PO Qty",
                "value": totals["po_qty"],
                "indicator": "Blue",
                "datatype": "Float",
            },
        ]

        # ✅ Append totals row at the bottom of the data table
        data.append(totals)

    return columns, data, None, None, report_summary



def get_columns():
    return [
        {"label": "Date",                "fieldname": "date",                   "fieldtype": "Date",     "width": 100},
        {"label": "Customer PO Number",  "fieldname": "po_no",                  "fieldtype": "Data",     "width": 150},
        {"label": "SO Category",         "fieldname": "order_type",             "fieldtype": "Data",     "width": 140},
        {"label": "Sales Order",         "fieldname": "so",                     "fieldtype": "Link",     "options": "Sales Order",  "width": 150},
        {"label": "Sales Person",        "fieldname": "sales_person",           "fieldtype": "Data",     "width": 150},
        {"label": "Customer Name",       "fieldname": "customer_name",          "fieldtype": "Data",     "width": 180},
        {"label": "Certificate",         "fieldname": "custom_certificate",     "fieldtype": "Select",   "options": "\nTC\nCC\nTC/CC", "width": 120},
        {"label": "Part Number",         "fieldname": "item_code",              "fieldtype": "Link",     "options": "Item",         "width": 120},
        {"label": "Qty",                 "fieldname": "qty",                    "fieldtype": "Float",    "width": 80},
        {"label": "Unit Price",          "fieldname": "rate",                   "fieldtype": "Currency", "width": 100},
        {"label": "Total Price",         "fieldname": "amount",                 "fieldtype": "Currency", "width": 120},
        {"label": "Sales EDD",           "fieldname": "custom_edd",             "fieldtype": "Date",     "width": 120},

        # ── Billed / Pending — same formula as Sales Order Analysis ──
        {"label": "Qty Billed",          "fieldname": "qty_billed",             "fieldtype": "Float",    "width": 100},
        {"label": "Qty Pending",         "fieldname": "qty_pending",            "fieldtype": "Float",    "width": 100},
        {"label": "Amount Billed",       "fieldname": "amount_billed",          "fieldtype": "Currency", "width": 120},
        {"label": "Amount Pending",      "fieldname": "amount_pending",         "fieldtype": "Currency", "width": 120},

        {"label": "Supplier Code",       "fieldname": "supplier",               "fieldtype": "Link",     "options": "Supplier",     "width": 150},
        {"label": "Supplier Name",       "fieldname": "supplier_name",          "fieldtype": "Data",     "width": 180},
        {"label": "PO Number",           "fieldname": "po",                     "fieldtype": "Link",     "options": "Purchase Order","width": 150},
        {"label": "PO Date",             "fieldname": "po_date",                "fieldtype": "Date",     "width": 100},
        {"label": "PO Item",             "fieldname": "po_item",                "fieldtype": "Data",     "width": 120},
        {"label": "PO Qty",              "fieldname": "po_qty",                 "fieldtype": "Float",    "width": 100},
        {"label": "Purchase EDD",        "fieldname": "expected_delivery_date", "fieldtype": "Date",     "width": 120},
        {"label": "In Transit",          "fieldname": "in_transit",             "fieldtype": "Check",    "width": 100},
        {"label": "AWB/MAWB Number",     "fieldname": "awb_number",             "fieldtype": "Data",     "width": 180},
        {"label": "Remark",              "fieldname": "custom_remark",          "fieldtype": "Data",     "width": 200},
    ]


def get_conditions(filters):
    conditions = ""

    if filters.get("from_date") and filters.get("to_date"):
        conditions += " AND so.transaction_date BETWEEN %(from_date)s AND %(to_date)s"

    if filters.get("company"):
        conditions += " AND so.company = %(company)s"

    if filters.get("sales_order") and len(filters.get("sales_order")) > 0:
        conditions += " AND so.name IN %(sales_order)s"

    if filters.get("status") and len(filters.get("status")) > 0:
        conditions += " AND so.status IN %(status)s"

    if filters.get("purchase_order") and len(filters.get("purchase_order")) > 0:
        conditions += " AND po.name IN %(purchase_order)s"

    return conditions


def get_data(filters):
    if not filters:
        filters = {}

    # Convert lists to tuples for SQL IN clause
    for key in ("sales_order", "purchase_order", "status"):
        if filters.get(key) and isinstance(filters[key], list):
            filters[key] = tuple(filters[key])

    conditions = get_conditions(filters)

    data = frappe.db.sql("""
        SELECT
            so.transaction_date                                             AS date,
            so.po_no,
            so.order_type,
            so.name                                                         AS so,

            -- ✅ Correlated subquery — fetches sales persons without JOIN row multiplication
            (
                SELECT GROUP_CONCAT(DISTINCT st.sales_person ORDER BY st.idx SEPARATOR ', ')
                FROM `tabSales Team` st
                WHERE st.parent     = so.name
                  AND st.parenttype = 'Sales Order'
            )                                                               AS sales_person,

            so.customer_name,
            so.custom_certificate,

            soi.item_code,
            soi.qty,
            soi.rate,
            soi.base_amount                                                 AS amount,
            soi.custom_edd,

            IFNULL(soi.delivered_qty, 0)                                    AS qty_billed,

            (soi.qty - IFNULL(soi.delivered_qty, 0))                        AS qty_pending,

            (soi.billed_amt * IFNULL(so.conversion_rate, 1))                AS amount_billed,

            (soi.base_amount - (soi.billed_amt * IFNULL(so.conversion_rate, 1))) AS amount_pending,

            sup.name                                                        AS supplier,
            sup.supplier_name,
            po.name                                                         AS po,
            po.transaction_date                                             AS po_date,

            poi.item_code                                                   AS po_item,
            poi.qty                                                         AS po_qty,
            poi.expected_delivery_date,
            poi.custom_good_in_transit                                      AS in_transit,
            poi.custom_awbmawb_number                                       AS awb_number,
            poi.custom_remark,
            poi.name                                                        AS poi_name

        FROM `tabSales Order` so

        -- ── Join SO items — same as standard report ──
        INNER JOIN `tabSales Order Item` soi
            ON soi.parent = so.name

        -- ── PO item matched by SO name + SO item ──
        LEFT JOIN `tabPurchase Order Item` poi
             ON poi.sales_order      = so.name
            AND poi.sales_order_item = soi.name

        -- ── PO header — only submitted ──
        LEFT JOIN `tabPurchase Order` po
            ON po.name      = poi.parent
           AND po.docstatus = 1

        LEFT JOIN `tabSupplier` sup
            ON sup.name = po.supplier

        WHERE
            so.docstatus = 1
            AND so.status NOT IN ('Cancelled', 'Closed', 'Completed')
            {conditions}

        GROUP BY soi.name

        ORDER BY so.transaction_date DESC, so.name, soi.idx

    """.format(conditions=conditions), filters, as_dict=1)

    return data


def get_totals_row(data):
    totals = {
        "date":                   None,
        "po_no":                  None,
        "order_type":             None,
        "so":                     None,
        "sales_person":           None,
        "customer_name":          "Total",
        "custom_certificate":     None,
        "item_code":              None,
        "qty":                    0,
        "rate":                   None,
        "amount":                 0,
        "custom_edd":             None,
        "qty_billed":             0,
        "qty_pending":            0,
        "amount_billed":          0,
        "amount_pending":         0,
        "supplier":               None,
        "supplier_name":          None,
        "po":                     None,
        "po_date":                None,
        "po_item":                None,
        "po_qty":                 0,
        "expected_delivery_date": None,
        "in_transit":             None,
        "awb_number":             None,
        "custom_remark":          None,
        "poi_name":               None,
        "is_total_row":           True,
    }

    for row in data:
        totals["qty"]            += (row.get("qty")            or 0)
        totals["amount"]         += (row.get("amount")         or 0)
        totals["qty_billed"]     += (row.get("qty_billed")     or 0)
        totals["qty_pending"]    += (row.get("qty_pending")    or 0)
        totals["amount_billed"]  += (row.get("amount_billed")  or 0)
        totals["amount_pending"] += (row.get("amount_pending") or 0)
        totals["po_qty"]         += (row.get("po_qty")         or 0)

    return totals


# ── Whitelisted update helpers ─────────────────────────────────────────────────

@frappe.whitelist()
def update_in_transit(poi_name, value):
    frappe.db.set_value("Purchase Order Item", poi_name, "custom_good_in_transit", value)
    frappe.db.commit()


@frappe.whitelist()
def update_awb_number(poi_name, awb_number):
    frappe.db.set_value("Purchase Order Item", poi_name, "custom_awbmawb_number", awb_number)
    frappe.db.commit()

# hi
@frappe.whitelist()
def update_remark(poi_name, remark):
    frappe.db.set_value("Purchase Order Item", poi_name, "custom_remark", remark)
    frappe.db.commit()