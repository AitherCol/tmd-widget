import{r as a,j as t}from"./index-DkIiY9Ul.js";import{l as p,a as _}from"./axios-BITR5ggg.js";import{h as c,u as v,Q as w,B as f}from"./useInterval-CVVbvUix.js";import{g as o,c as i}from"./utils-Dua54zap.js";c.locale("ru");function k(){const r=new URLSearchParams(window.location.search),n=r.get("key"),d=r.get("id"),[e,g]=a.useState(),[m,u]=a.useState("");v(()=>{e&&e.show_remaining_time&&e.end_at&&!e.ended_at&&u(c(e.end_at).fromNow(!0))},1e3);const l=async()=>{try{const{data:s}=await _.get(`https://api.tipmeadollar.com/public/goal?id=${d}&token=${n}`);g(s.goal)}catch{f.error("произошла неизвестная ошибка!")}};return a.useEffect(()=>{l()},[]),a.useEffect(()=>{const s=p("https://socket.tipmeadollar.com",{reconnection:!0,reconnectionDelayMax:5e3,reconnectionDelay:1e3});return s.on("connect",()=>{console.log("Connected to Socket.IO server"),s.emit("authenticate",JSON.stringify({token:n,ignoreNew:!0}))}),s.on("donations:new",h=>{const x=JSON.parse(h);console.log("New donation received",x),l()}),()=>{s.disconnect()}},[]),t.jsxs("div",{className:"widget",children:[t.jsx(w,{position:"bottom-center",autoClose:5e3,hideProgressBar:!1,newestOnTop:!1,closeOnClick:!0,toastStyle:{backgroundColor:"#202020"},rtl:!1,pauseOnFocusLoss:!0,draggable:!0,pauseOnHover:!0,theme:"dark"}),e?t.jsx("div",{className:"goal-page",children:t.jsxs("div",{className:"goal",children:[t.jsx("div",{className:"goal-header",children:t.jsx("p",{className:"goal-title goal-text",style:o(e.title_settings,"vw"),children:e.title})}),t.jsxs("div",{className:"goal-body",style:{minHeight:`${e.indicator_height}vw`},children:[t.jsx("div",{className:"goal-progress-bar",style:{backgroundColor:e.indicator_color,borderRadius:`${e.border_radius}vw`,minHeight:`${e.indicator_height}vw`,borderColor:e.stroke_color,borderWidth:`${e.stroke_radius}vw`},children:t.jsx("div",{className:"progress-bar-filler",style:{backgroundColor:e.indicator_filled_color,right:`${100-i(e.amount,e.goal_amount,!0)}%`,transition:"right 1ms"}})}),t.jsxs("p",{className:"goal-progress-text goal-text",style:o(e.progress_settings,"vw"),children:[e.amount/100," ",e.currency," (",i(e.amount,e.goal_amount).toFixed(0),"%)"]})]}),t.jsxs("div",{className:"goal-footer",children:[e.show_goal_borders?t.jsxs("div",{className:"goal-borders",children:[t.jsx("p",{className:"goal-progress-text goal-border start",style:{...o(e.borders_settings,"vw"),textAlign:"start"},children:"0"}),t.jsx("p",{className:"goal-progress-text goal-border end",style:{...o(e.borders_settings,"vw"),textAlign:"end"},children:e.goal_amount/100})]}):t.jsx(t.Fragment,{}),e.show_remaining_time&&e.end_at&&!e.ended_at?t.jsxs("p",{className:"goal-time-left goal-text",style:{...o(e.remaining_time_settings,"vw"),textAlign:"center"},children:["Осталось ",m]}):t.jsx(t.Fragment,{}),e.ended_at&&t.jsx("p",{className:"goal-time-left goal-text",style:{...o(e.remaining_time_settings,"vw"),textAlign:"center"},children:"Сбор завершен"})]})]})}):t.jsx(t.Fragment,{})]})}export{k as default};
