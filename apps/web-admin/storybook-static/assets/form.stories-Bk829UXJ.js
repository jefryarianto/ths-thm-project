import{c as e,i as t}from"./preload-helper-D2yxXLVK.js";import{$ as n,j as r}from"./iframe-Cx3N5IyB.js";import{n as i,t as a}from"./utils-CMVnEVHk.js";import{n as o,t as s}from"./label-DA9PpvsN.js";import{n as c,t as l}from"./input-CrkgdOxh.js";function u({label:e,error:t,required:n,children:r,className:i}){return(0,d.jsxs)(`div`,{className:a(`space-y-2`,i),children:[e&&(0,d.jsxs)(s,{children:[e,n&&(0,d.jsx)(`span`,{className:`ml-1 text-destructive`,children:`*`})]}),r,t&&(0,d.jsx)(`p`,{className:`text-sm font-medium text-destructive`,children:t.message})]})}var d,f,p,m=t((()=>{d=r(),f=e(n()),o(),i(),p=(0,f.forwardRef)(({className:e,children:t,...n},r)=>t?(0,d.jsx)(`p`,{ref:r,className:a(`text-sm font-medium text-destructive`,e),...n,children:t}):null),p.displayName=`FormMessage`,u.__docgenInfo={description:``,methods:[],displayName:`FormFieldWrapper`,props:{label:{required:!1,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`FieldError`},description:``},required:{required:!1,tsType:{name:`boolean`},description:``},children:{required:!0,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}},p.__docgenInfo={description:``,methods:[],displayName:`FormMessage`}})),h,g,_,v,y,b,x,S,C,w;t((()=>{h=r(),m(),c(),g={title:`UI/Form`,component:u,parameters:{layout:`centered`},tags:[`autodocs`]},_={render:()=>(0,h.jsx)(`div`,{className:`w-[300px]`,children:(0,h.jsx)(u,{label:`Nama Lengkap`,children:(0,h.jsx)(l,{placeholder:`Masukkan nama lengkap`})})})},v={render:()=>(0,h.jsx)(`div`,{className:`w-[300px]`,children:(0,h.jsx)(u,{label:`Email`,required:!0,children:(0,h.jsx)(l,{type:`email`,placeholder:`email@example.com`})})})},y={render:()=>(0,h.jsx)(`div`,{className:`w-[300px]`,children:(0,h.jsx)(u,{label:`Password`,required:!0,error:{type:`manual`,message:`Password minimal 8 karakter`},children:(0,h.jsx)(l,{type:`password`,defaultValue:`abc`})})})},b={render:()=>(0,h.jsx)(`div`,{className:`w-[300px]`,children:(0,h.jsx)(u,{label:`Deskripsi`,error:{type:`manual`,message:`Deskripsi harus diisi dan tidak boleh mengandung karakter khusus atau URL yang tidak valid.`},children:(0,h.jsx)(l,{})})})},x={render:()=>(0,h.jsx)(`div`,{className:`w-[300px]`,children:(0,h.jsx)(u,{children:(0,h.jsx)(l,{placeholder:`Input tanpa label`})})})},S={render:()=>(0,h.jsxs)(`div`,{className:`w-[300px] space-y-4`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{className:`mb-1 text-sm font-medium`,children:`With error:`}),(0,h.jsx)(p,{children:`Email sudah terdaftar`})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{className:`mb-1 text-sm font-medium`,children:`Empty (null):`}),(0,h.jsx)(p,{children:null}),(0,h.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`Tidak merender apapun`})]})]})},C={render:()=>(0,h.jsxs)(`div`,{className:`w-[350px] space-y-4 rounded-lg border p-4`,children:[(0,h.jsx)(`h3`,{className:`text-lg font-semibold`,children:`Register`}),(0,h.jsx)(u,{label:`Nama`,required:!0,children:(0,h.jsx)(l,{placeholder:`Nama lengkap`})}),(0,h.jsx)(u,{label:`Email`,required:!0,children:(0,h.jsx)(l,{type:`email`,placeholder:`email@example.com`})}),(0,h.jsx)(u,{label:`Password`,required:!0,error:{type:`manual`,message:`Password minimal 8 karakter`},children:(0,h.jsx)(l,{type:`password`})}),(0,h.jsx)(u,{label:`Bio`,children:(0,h.jsx)(l,{placeholder:`Cerita singkat tentang diri Anda`})})]})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">\r
      <FormFieldWrapper label="Nama Lengkap">\r
        <Input placeholder="Masukkan nama lengkap" />\r
      </FormFieldWrapper>\r
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">\r
      <FormFieldWrapper label="Email" required>\r
        <Input type="email" placeholder="email@example.com" />\r
      </FormFieldWrapper>\r
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">\r
      <FormFieldWrapper label="Password" required error={{
      type: "manual",
      message: "Password minimal 8 karakter"
    }}>\r
        <Input type="password" defaultValue="abc" />\r
      </FormFieldWrapper>\r
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">\r
      <FormFieldWrapper label="Deskripsi" error={{
      type: "manual",
      message: "Deskripsi harus diisi dan tidak boleh mengandung karakter khusus atau URL yang tidak valid."
    }}>\r
        <Input />\r
      </FormFieldWrapper>\r
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">\r
      <FormFieldWrapper>\r
        <Input placeholder="Input tanpa label" />\r
      </FormFieldWrapper>\r
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px] space-y-4">\r
      <div>\r
        <p className="mb-1 text-sm font-medium">With error:</p>\r
        <FormMessage>Email sudah terdaftar</FormMessage>\r
      </div>\r
      <div>\r
        <p className="mb-1 text-sm font-medium">Empty (null):</p>\r
        <FormMessage>{null}</FormMessage>\r
        <p className="text-xs text-muted-foreground">Tidak merender apapun</p>\r
      </div>\r
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[350px] space-y-4 rounded-lg border p-4">\r
      <h3 className="text-lg font-semibold">Register</h3>\r
      <FormFieldWrapper label="Nama" required>\r
        <Input placeholder="Nama lengkap" />\r
      </FormFieldWrapper>\r
      <FormFieldWrapper label="Email" required>\r
        <Input type="email" placeholder="email@example.com" />\r
      </FormFieldWrapper>\r
      <FormFieldWrapper label="Password" required error={{
      type: "manual",
      message: "Password minimal 8 karakter"
    }}>\r
        <Input type="password" />\r
      </FormFieldWrapper>\r
      <FormFieldWrapper label="Bio">\r
        <Input placeholder="Cerita singkat tentang diri Anda" />\r
      </FormFieldWrapper>\r
    </div>
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithRequired`,`WithError`,`WithLongError`,`WithoutLabel`,`FormMessageExample`,`FormExample`]}))();export{_ as Default,C as FormExample,S as FormMessageExample,y as WithError,b as WithLongError,v as WithRequired,x as WithoutLabel,w as __namedExportsOrder,g as default};