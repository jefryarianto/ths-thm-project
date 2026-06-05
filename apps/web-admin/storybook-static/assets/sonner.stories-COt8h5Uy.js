import{i as e}from"./preload-helper-D2yxXLVK.js";import{c as t,j as n,s as r}from"./iframe-Cx3N5IyB.js";import{n as i,t as a}from"./button-1uNtGEHO.js";import{H as o,O as s,R as c,ot as l,t as u,u as d}from"./lucide-react-C2wKu_9A.js";import{n as f,r as p,t as m}from"./dist-BO57j4O3.js";var h,g,_=e((()=>{h=n(),r(),f(),u(),g=({...e})=>{let{theme:n=`system`}=t();return(0,h.jsx)(m,{theme:n,className:`toaster group`,icons:{success:(0,h.jsx)(l,{className:`size-4`}),info:(0,h.jsx)(o,{className:`size-4`}),warning:(0,h.jsx)(d,{className:`size-4`}),error:(0,h.jsx)(s,{className:`size-4`}),loading:(0,h.jsx)(c,{className:`size-4 animate-spin`})},style:{"--normal-bg":`var(--popover)`,"--normal-text":`var(--popover-foreground)`,"--normal-border":`var(--border)`,"--border-radius":`var(--radius)`},toastOptions:{classNames:{toast:`cn-toast`}},...e})},g.__docgenInfo={description:``,methods:[],displayName:`Toaster`}})),v,y,b,x,S,C,w;e((()=>{v=n(),f(),_(),i(),y={title:`UI/Toaster`,component:g,parameters:{layout:`centered`},tags:[`autodocs`]},b={render:()=>(0,v.jsxs)(`div`,{className:`flex flex-col items-center gap-4`,children:[(0,v.jsx)(g,{}),(0,v.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Click buttons below to trigger different toast notifications.`}),(0,v.jsxs)(`div`,{className:`flex flex-wrap justify-center gap-2`,children:[(0,v.jsx)(a,{variant:`outline`,onClick:()=>p(`Hello, world!`),children:`Default Toast`}),(0,v.jsx)(a,{variant:`outline`,onClick:()=>p.success(`Data berhasil disimpan!`),children:`Success`}),(0,v.jsx)(a,{variant:`outline`,onClick:()=>p.error(`Gagal menghubungi server.`),children:`Error`}),(0,v.jsx)(a,{variant:`outline`,onClick:()=>p.info(`Anda memiliki 3 notifikasi baru.`),children:`Info`}),(0,v.jsx)(a,{variant:`outline`,onClick:()=>p.warning(`Sesi akan berakhir dalam 5 menit.`),children:`Warning`}),(0,v.jsx)(a,{variant:`outline`,onClick:()=>p(`Custom Action`,{action:{label:`Undo`,onClick:()=>p.info(`Undone!`)}}),children:`With Action`})]})]})},x={render:()=>(0,v.jsxs)(`div`,{className:`flex flex-col items-center gap-4`,children:[(0,v.jsx)(g,{}),(0,v.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Click to see a sequence of all toast types.`}),(0,v.jsx)(a,{variant:`default`,onClick:()=>{p(`Default notification`),setTimeout(()=>p.success(`Operation successful!`),300),setTimeout(()=>p.info(`Something new happened`),600),setTimeout(()=>p.warning(`Please check your input`),900),setTimeout(()=>p.error(`An error occurred`),1200)},children:`Show All Types`})]})},S={render:()=>(0,v.jsxs)(`div`,{className:`flex flex-col items-center gap-4`,children:[(0,v.jsx)(g,{}),(0,v.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Click to simulate an async operation with loading/success states.`}),(0,v.jsx)(a,{variant:`default`,onClick:()=>{let e=new Promise(e=>setTimeout(()=>e(`Data loaded successfully!`),2e3));p.promise(e,{loading:`Loading data...`,success:e=>e,error:`Failed to load data`})},children:`Simulate Loading`})]})},C={render:()=>(0,v.jsxs)(`div`,{className:`flex flex-col items-center gap-4`,children:[(0,v.jsx)(g,{}),(0,v.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Toast with rich content and extended duration.`}),(0,v.jsx)(a,{variant:`outline`,onClick:()=>{p.success(`Pembayaran Iuran Berhasil!`,{description:`Pembayaran iuran bulan Mei 2026 sebesar Rp 50.000 telah dikonfirmasi. Terima kasih!`,duration:5e3})},children:`Show Rich Toast`})]})},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col items-center gap-4">\r
      <Toaster />\r
      <p className="text-sm text-muted-foreground">\r
        Click buttons below to trigger different toast notifications.\r
      </p>\r
      <div className="flex flex-wrap justify-center gap-2">\r
        <Button variant="outline" onClick={() => toast("Hello, world!")}>\r
          Default Toast\r
        </Button>\r
        <Button variant="outline" onClick={() => toast.success("Data berhasil disimpan!")}>\r
          Success\r
        </Button>\r
        <Button variant="outline" onClick={() => toast.error("Gagal menghubungi server.")}>\r
          Error\r
        </Button>\r
        <Button variant="outline" onClick={() => toast.info("Anda memiliki 3 notifikasi baru.")}>\r
          Info\r
        </Button>\r
        <Button variant="outline" onClick={() => toast.warning("Sesi akan berakhir dalam 5 menit.")}>\r
          Warning\r
        </Button>\r
        <Button variant="outline" onClick={() => toast("Custom Action", {
        action: {
          label: "Undo",
          onClick: () => toast.info("Undone!")
        }
      })}>\r
          With Action\r
        </Button>\r
      </div>\r
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col items-center gap-4">\r
      <Toaster />\r
      <p className="text-sm text-muted-foreground">\r
        Click to see a sequence of all toast types.\r
      </p>\r
      <Button variant="default" onClick={() => {
      toast("Default notification");
      setTimeout(() => toast.success("Operation successful!"), 300);
      setTimeout(() => toast.info("Something new happened"), 600);
      setTimeout(() => toast.warning("Please check your input"), 900);
      setTimeout(() => toast.error("An error occurred"), 1200);
    }}>\r
        Show All Types\r
      </Button>\r
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col items-center gap-4">\r
      <Toaster />\r
      <p className="text-sm text-muted-foreground">\r
        Click to simulate an async operation with loading/success states.\r
      </p>\r
      <Button variant="default" onClick={() => {
      const promise = new Promise<string>(resolve => setTimeout(() => resolve("Data loaded successfully!"), 2000));
      toast.promise(promise, {
        loading: "Loading data...",
        success: data => data,
        error: "Failed to load data"
      });
    }}>\r
        Simulate Loading\r
      </Button>\r
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col items-center gap-4">\r
      <Toaster />\r
      <p className="text-sm text-muted-foreground">\r
        Toast with rich content and extended duration.\r
      </p>\r
      <Button variant="outline" onClick={() => {
      toast.success("Pembayaran Iuran Berhasil!", {
        description: "Pembayaran iuran bulan Mei 2026 sebesar Rp 50.000 telah dikonfirmasi. Terima kasih!",
        duration: 5000
      });
    }}>\r
        Show Rich Toast\r
      </Button>\r
    </div>
}`,...C.parameters?.docs?.source}}},w=[`Default`,`ToastTypes`,`WithPromise`,`RichContent`]}))();export{b as Default,C as RichContent,x as ToastTypes,S as WithPromise,w as __namedExportsOrder,y as default};