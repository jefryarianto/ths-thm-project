import{i as e}from"./preload-helper-D2yxXLVK.js";import{j as t}from"./iframe-Cx3N5IyB.js";import{n,t as r}from"./utils-CMVnEVHk.js";function i({className:e,...t}){return(0,f.jsx)(`div`,{"data-slot":`table-container`,className:`relative w-full overflow-x-auto`,children:(0,f.jsx)(`table`,{"data-slot":`table`,className:r(`w-full caption-bottom text-sm`,e),...t})})}function a({className:e,...t}){return(0,f.jsx)(`thead`,{"data-slot":`table-header`,className:r(`[&_tr]:border-b`,e),...t})}function o({className:e,...t}){return(0,f.jsx)(`tbody`,{"data-slot":`table-body`,className:r(`[&_tr:last-child]:border-0`,e),...t})}function s({className:e,...t}){return(0,f.jsx)(`tfoot`,{"data-slot":`table-footer`,className:r(`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0`,e),...t})}function c({className:e,...t}){return(0,f.jsx)(`tr`,{"data-slot":`table-row`,className:r(`border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted`,e),...t})}function l({className:e,...t}){return(0,f.jsx)(`th`,{"data-slot":`table-head`,className:r(`h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0`,e),...t})}function u({className:e,...t}){return(0,f.jsx)(`td`,{"data-slot":`table-cell`,className:r(`p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0`,e),...t})}function d({className:e,...t}){return(0,f.jsx)(`caption`,{"data-slot":`table-caption`,className:r(`mt-4 text-sm text-muted-foreground`,e),...t})}var f,p=e((()=>{f=t(),n(),i.__docgenInfo={description:``,methods:[],displayName:`Table`},a.__docgenInfo={description:``,methods:[],displayName:`TableHeader`},o.__docgenInfo={description:``,methods:[],displayName:`TableBody`},s.__docgenInfo={description:``,methods:[],displayName:`TableFooter`},l.__docgenInfo={description:``,methods:[],displayName:`TableHead`},c.__docgenInfo={description:``,methods:[],displayName:`TableRow`},u.__docgenInfo={description:``,methods:[],displayName:`TableCell`},d.__docgenInfo={description:``,methods:[],displayName:`TableCaption`}})),m,h,g,_,v,y,b,x;e((()=>{m=t(),p(),h={title:`UI/Table`,component:i,parameters:{layout:`centered`},tags:[`autodocs`]},g=[{name:`John Doe`,email:`john@example.com`,role:`Admin`,status:`Active`},{name:`Jane Smith`,email:`jane@example.com`,role:`User`,status:`Active`},{name:`Bob Johnson`,email:`bob@example.com`,role:`User`,status:`Inactive`},{name:`Alice Brown`,email:`alice@example.com`,role:`Editor`,status:`Active`},{name:`Charlie Wilson`,email:`charlie@example.com`,role:`User`,status:`Active`}],_={render:()=>(0,m.jsxs)(i,{children:[(0,m.jsx)(d,{children:`List of users`}),(0,m.jsx)(a,{children:(0,m.jsxs)(c,{children:[(0,m.jsx)(l,{children:`Name`}),(0,m.jsx)(l,{children:`Email`}),(0,m.jsx)(l,{children:`Role`}),(0,m.jsx)(l,{className:`text-right`,children:`Status`})]})}),(0,m.jsx)(o,{children:g.map(e=>(0,m.jsxs)(c,{children:[(0,m.jsx)(u,{className:`font-medium`,children:e.name}),(0,m.jsx)(u,{children:e.email}),(0,m.jsx)(u,{children:e.role}),(0,m.jsx)(u,{className:`text-right`,children:e.status})]},e.name))}),(0,m.jsx)(s,{children:(0,m.jsxs)(c,{children:[(0,m.jsx)(u,{colSpan:3,children:`Total Users`}),(0,m.jsx)(u,{className:`text-right`,children:g.length})]})})]})},v={render:()=>(0,m.jsx)(i,{children:(0,m.jsxs)(o,{children:[(0,m.jsxs)(c,{children:[(0,m.jsx)(u,{children:`Cell 1`}),(0,m.jsx)(u,{children:`Cell 2`}),(0,m.jsx)(u,{children:`Cell 3`})]}),(0,m.jsxs)(c,{children:[(0,m.jsx)(u,{children:`Cell 4`}),(0,m.jsx)(u,{children:`Cell 5`}),(0,m.jsx)(u,{children:`Cell 6`})]})]})})},y={render:()=>(0,m.jsxs)(i,{children:[(0,m.jsx)(d,{children:`Monthly sales report`}),(0,m.jsx)(a,{children:(0,m.jsxs)(c,{children:[(0,m.jsx)(l,{children:`Product`}),(0,m.jsx)(l,{className:`text-right`,children:`Qty`}),(0,m.jsx)(l,{className:`text-right`,children:`Price`}),(0,m.jsx)(l,{className:`text-right`,children:`Total`})]})}),(0,m.jsx)(o,{children:[{product:`Widget A`,qty:5,price:1e4,total:5e4},{product:`Widget B`,qty:3,price:15e3,total:45e3},{product:`Widget C`,qty:8,price:7500,total:6e4}].map(e=>(0,m.jsxs)(c,{children:[(0,m.jsx)(u,{className:`font-medium`,children:e.product}),(0,m.jsx)(u,{className:`text-right`,children:e.qty}),(0,m.jsxs)(u,{className:`text-right`,children:[`Rp `,e.price.toLocaleString(`id`)]}),(0,m.jsxs)(u,{className:`text-right`,children:[`Rp `,e.total.toLocaleString(`id`)]})]},e.product))}),(0,m.jsx)(s,{children:(0,m.jsxs)(c,{children:[(0,m.jsx)(u,{colSpan:3,children:`Grand Total`}),(0,m.jsx)(u,{className:`text-right`,children:`Rp 155.000`})]})})]})},b={render:()=>(0,m.jsxs)(i,{children:[(0,m.jsx)(a,{children:(0,m.jsxs)(c,{children:[(0,m.jsx)(l,{children:`#`}),(0,m.jsx)(l,{children:`Name`}),(0,m.jsx)(l,{children:`Value`})]})}),(0,m.jsx)(o,{children:Array.from({length:20},(e,t)=>(0,m.jsxs)(c,{children:[(0,m.jsx)(u,{children:t+1}),(0,m.jsxs)(u,{children:[`Item `,t+1]}),(0,m.jsxs)(u,{children:[`Value `,t+1]})]},t))})]})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Table>\r
      <TableCaption>List of users</TableCaption>\r
      <TableHeader>\r
        <TableRow>\r
          <TableHead>Name</TableHead>\r
          <TableHead>Email</TableHead>\r
          <TableHead>Role</TableHead>\r
          <TableHead className="text-right">Status</TableHead>\r
        </TableRow>\r
      </TableHeader>\r
      <TableBody>\r
        {sampleData.map(row => <TableRow key={row.name}>\r
            <TableCell className="font-medium">{row.name}</TableCell>\r
            <TableCell>{row.email}</TableCell>\r
            <TableCell>{row.role}</TableCell>\r
            <TableCell className="text-right">{row.status}</TableCell>\r
          </TableRow>)}\r
      </TableBody>\r
      <TableFooter>\r
        <TableRow>\r
          <TableCell colSpan={3}>Total Users</TableCell>\r
          <TableCell className="text-right">{sampleData.length}</TableCell>\r
        </TableRow>\r
      </TableFooter>\r
    </Table>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Table>\r
      <TableBody>\r
        <TableRow>\r
          <TableCell>Cell 1</TableCell>\r
          <TableCell>Cell 2</TableCell>\r
          <TableCell>Cell 3</TableCell>\r
        </TableRow>\r
        <TableRow>\r
          <TableCell>Cell 4</TableCell>\r
          <TableCell>Cell 5</TableCell>\r
          <TableCell>Cell 6</TableCell>\r
        </TableRow>\r
      </TableBody>\r
    </Table>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Table>\r
      <TableCaption>Monthly sales report</TableCaption>\r
      <TableHeader>\r
        <TableRow>\r
          <TableHead>Product</TableHead>\r
          <TableHead className="text-right">Qty</TableHead>\r
          <TableHead className="text-right">Price</TableHead>\r
          <TableHead className="text-right">Total</TableHead>\r
        </TableRow>\r
      </TableHeader>\r
      <TableBody>\r
        {[{
        product: "Widget A",
        qty: 5,
        price: 10000,
        total: 50000
      }, {
        product: "Widget B",
        qty: 3,
        price: 15000,
        total: 45000
      }, {
        product: "Widget C",
        qty: 8,
        price: 7500,
        total: 60000
      }].map(row => <TableRow key={row.product}>\r
            <TableCell className="font-medium">{row.product}</TableCell>\r
            <TableCell className="text-right">{row.qty}</TableCell>\r
            <TableCell className="text-right">Rp {row.price.toLocaleString("id")}</TableCell>\r
            <TableCell className="text-right">Rp {row.total.toLocaleString("id")}</TableCell>\r
          </TableRow>)}\r
      </TableBody>\r
      <TableFooter>\r
        <TableRow>\r
          <TableCell colSpan={3}>Grand Total</TableCell>\r
          <TableCell className="text-right">Rp 155.000</TableCell>\r
        </TableRow>\r
      </TableFooter>\r
    </Table>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Table>\r
      <TableHeader>\r
        <TableRow>\r
          <TableHead>#</TableHead>\r
          <TableHead>Name</TableHead>\r
          <TableHead>Value</TableHead>\r
        </TableRow>\r
      </TableHeader>\r
      <TableBody>\r
        {Array.from({
        length: 20
      }, (_, i) => <TableRow key={i}>\r
            <TableCell>{i + 1}</TableCell>\r
            <TableCell>Item {i + 1}</TableCell>\r
            <TableCell>Value {i + 1}</TableCell>\r
          </TableRow>)}\r
      </TableBody>\r
    </Table>
}`,...b.parameters?.docs?.source}}},x=[`Default`,`Minimal`,`WithFooter`,`ManyRows`]}))();export{_ as Default,b as ManyRows,v as Minimal,y as WithFooter,x as __namedExportsOrder,h as default};