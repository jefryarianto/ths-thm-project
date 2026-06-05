import{i as e}from"./preload-helper-D2yxXLVK.js";import{j as t}from"./iframe-Cx3N5IyB.js";import{n,t as r}from"./label-DA9PpvsN.js";import{n as i,t as a}from"./textarea--20W1Yqv.js";var o,s,c,l,u,d,f,p,m,h;e((()=>{o=t(),i(),n(),s={title:`UI/Textarea`,component:a,parameters:{layout:`centered`},tags:[`autodocs`],argTypes:{disabled:{control:`boolean`},placeholder:{control:`text`}}},c={args:{placeholder:`Tulis sesuatu...`}},l={args:{value:`Ini adalah contoh teks yang sudah diisi dalam textarea.`,readOnly:!0}},u={render:()=>(0,o.jsxs)(`div`,{className:`grid w-[400px] gap-2`,children:[(0,o.jsx)(r,{htmlFor:`bio`,children:`Biografi`}),(0,o.jsx)(a,{id:`bio`,placeholder:`Ceritakan tentang diri Anda...`})]})},d={args:{placeholder:`Textarea disabled`,disabled:!0}},f={render:()=>(0,o.jsxs)(`div`,{className:`grid w-[400px] gap-2`,children:[(0,o.jsx)(r,{htmlFor:`desc-with-error`,children:`Deskripsi`}),(0,o.jsx)(a,{id:`desc-with-error`,defaultValue:`Pendek`,className:`border-destructive focus-visible:ring-destructive`}),(0,o.jsx)(`p`,{className:`text-sm font-medium text-destructive`,children:`Deskripsi minimal 50 karakter`})]})},p={render:()=>(0,o.jsxs)(`div`,{className:`flex w-[400px] flex-col gap-4`,children:[(0,o.jsxs)(`div`,{className:`grid gap-2`,children:[(0,o.jsx)(r,{htmlFor:`small-textarea`,children:`Small (3 rows)`}),(0,o.jsx)(a,{id:`small-textarea`,rows:3,placeholder:`Textarea kecil...`})]}),(0,o.jsxs)(`div`,{className:`grid gap-2`,children:[(0,o.jsx)(r,{htmlFor:`large-textarea`,children:`Large (8 rows)`}),(0,o.jsx)(a,{id:`large-textarea`,rows:8,placeholder:`Textarea besar...`})]})]})},m={render:()=>(0,o.jsxs)(`div`,{className:`grid w-[400px] gap-2`,children:[(0,o.jsx)(r,{htmlFor:`limited-textarea`,children:`Bio (max 100 karakter)`}),(0,o.jsx)(a,{id:`limited-textarea`,maxLength:100,placeholder:`Maksimal 100 karakter...`,defaultValue:`Halo, saya seorang developer.`}),(0,o.jsx)(`p`,{className:`text-xs text-muted-foreground text-right`,children:`32/100`})]})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Tulis sesuatu..."
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: "Ini adalah contoh teks yang sudah diisi dalam textarea.",
    readOnly: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[400px] gap-2">\r
      <Label htmlFor="bio">Biografi</Label>\r
      <Textarea id="bio" placeholder="Ceritakan tentang diri Anda..." />\r
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: "Textarea disabled",
    disabled: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[400px] gap-2">\r
      <Label htmlFor="desc-with-error">Deskripsi</Label>\r
      <Textarea id="desc-with-error" defaultValue="Pendek" className="border-destructive focus-visible:ring-destructive" />\r
      <p className="text-sm font-medium text-destructive">\r
        Deskripsi minimal 50 karakter\r
      </p>\r
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-[400px] flex-col gap-4">\r
      <div className="grid gap-2">\r
        <Label htmlFor="small-textarea">Small (3 rows)</Label>\r
        <Textarea id="small-textarea" rows={3} placeholder="Textarea kecil..." />\r
      </div>\r
      <div className="grid gap-2">\r
        <Label htmlFor="large-textarea">Large (8 rows)</Label>\r
        <Textarea id="large-textarea" rows={8} placeholder="Textarea besar..." />\r
      </div>\r
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid w-[400px] gap-2">\r
      <Label htmlFor="limited-textarea">Bio (max 100 karakter)</Label>\r
      <Textarea id="limited-textarea" maxLength={100} placeholder="Maksimal 100 karakter..." defaultValue="Halo, saya seorang developer." />\r
      <p className="text-xs text-muted-foreground text-right">32/100</p>\r
    </div>
}`,...m.parameters?.docs?.source}}},h=[`Default`,`WithValue`,`WithLabel`,`Disabled`,`WithError`,`Sizes`,`CharacterLimit`]}))();export{m as CharacterLimit,c as Default,d as Disabled,p as Sizes,f as WithError,u as WithLabel,l as WithValue,h as __namedExportsOrder,s as default};