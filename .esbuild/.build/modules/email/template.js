"use strict";var i=Object.create;var s=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var l=Object.getOwnPropertyNames;var c=Object.getPrototypeOf,h=Object.prototype.hasOwnProperty;var m=(e,t)=>{for(var a in t)s(e,a,{get:t[a],enumerable:!0})},n=(e,t,a,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of l(t))!h.call(e,o)&&o!==a&&s(e,o,{get:()=>t[o],enumerable:!(r=p(t,o))||r.enumerable});return e};var g=(e,t,a)=>(a=e!=null?i(c(e)):{},n(t||!e||!e.__esModule?s(a,"default",{value:e,enumerable:!0}):a,e)),u=e=>n(s({},"__esModule",{value:!0}),e);var x={};m(x,{handler:()=>y});module.exports=u(x);var d=g(require("aws-sdk")),f=new d.default.SESV2,b=`
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Order</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        h2{
            color:#005858;
            margin-left: 7px;
        }
        .purchase-order {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
        }
        .purchase-order h1 {
            text-align: center;
            font-size: 34px;
            margin-bottom: 20px;
            color: #005858;
        }
        .purchase-order .company-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .span{
            font-weight: bolder;
            color:#005858;
        }
        .purchase-order table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .purchase-order table, .purchase-order th, .purchase-order td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .purchase-order th {
            color: white;
            background-color: #005858;
        }
        .purchase-order .totals {
            text-align: right;
        }
        .purchase-order .totals span {
            display: inline-block;
            width: 150px;
        }
    </style>
</head>
<body>
    <div class="purchase-order">
        <h1>PURCHASE ORDER</h1>
        <div class="company-info">
            <div>  
                <h2><strong>Zero&One</strong></h2>
                <p><span class="span">Email: </span>{{ContactEmail}}</p>
            </div>  
            <div>
                <p><span class="span">Date:</span> {{Date}}</p>
                <p><span class="span">PO #:</span> {{OrderNumber}}</p>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>ITEM NAME</th>
                    <th>DESCRIPTION</th>
                    <th>QTY</th>
                    <th>UNIT PRICE</th>
                    <th>TOTAL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{order_name}}</td>
                    <td>{{order_desc}}</td>
                    <td>{{quantity}}</td>
                    <td>{{unit_price}}</td>
                    <td>{{Total}}</td>
                </tr>
            </tbody>
        </table>
        <div class="totals">

            <p><span class="span">TOTAL:</span> {{TotalPrice}}</p>
        </div>
        <p><strong>if you have any questions about this purchase order, please contact us.</strong> </p>
    </div>
</body>
`;var y=async e=>{let a={TemplateName:"AcceptanceOrderTemplateFinal2",TemplateContent:{Html:b,Subject:"Your Purchase Order",Text:""}};try{let r=await f.createEmailTemplate(a).promise();return console.log("Template Created",r),{statusCode:200,body:JSON.stringify({message:"Template created successfully",data:r})}}catch(r){return console.error("Error creating template:",r),{statusCode:500,body:JSON.stringify({message:"Failed to create template"})}}};0&&(module.exports={handler});
