/* All EN + AR copy, ported from eand-dark-assistant/js/content.js + config.js. */
export const IMG = {
  summer:"/images/hero/summer-campaign.png",
  money:"/images/hero/eand-money.jpg",
  emerald:"/images/hero/emerald.png",
  hekaya:"/images/hero/hekaya.png",
  esim:"/images/hero/esim.png",
  p1:"/images/plans/emerald.png",
  p2:"/images/plans/hekaya-mixat.png",
  p3:"/images/plans/hekaya-internet.png",
  p4:"/images/plans/akwa-kart.png",
  net:"/images/sections/switch-to-eand.png",
  trav:"/images/sections/hi-traveler.jpg",
  emoney:"/images/sections/eand-money.png",
  q1:"/icons/quick/ehome-dsl.png",
  q2:"/icons/quick/more-program.png",
  q3:"/icons/quick/dial-reservation.png",
  q4:"/icons/quick/track-order.png",
  flogo:"/icons/logo-footer.svg",
  viu:"/icons/viu.png",
  twist:"/icons/twist-music.png"
};

export const I18N = {
en:{
  langLabel:"عربي", langLabelClass:"ar-font", consumer:"Consumer", business:"Business", stores:"Stores", signin:"Sign In",
  details:"Details", knowMore:"Know More", knowMoreArrow:"Know More ↗", from:"Beginning From", perMonth:"EGP/Month",
  titles:{plans:["Our","Plans"], read:["Read","About"], svc:["Our","services"], ent:["Explore","Entertainment"]},
  nav:[
    {t:"Plans", href:"#plans", h:"Postpaid & Prepaid", items:["Emerald","Emerald GTO","More program","Hekaya Mixat","Hekaya Internet","Primo","Super connect (monthly)","Super Sa3at","Internet Megabytes","Data Line","Convert to 5G","Akwa kart","Spin and win","Flat tariffs","Prepaid daily plans","Menu el geneih","Ro2ya","Coins Program"]},
    {t:"eHome", href:"#"},
    {t:"Services", href:"#services", h:"Services", items:["e& money","Pensions","Prepaid recharge","Online payment","International money remittance","Call keeper","Video call","Voice mail","Call filter (nas w nas)","Wi‑Fi Calling","eSIM","Choose your number","Khattein service","Switch to e& Egypt","Balance transfer","Super sallefny","Raseedy","Traveling to Egypt","Traveling abroad","International calls","7070 directory"]},
    {t:"Entertainment", href:"#entertainment", h:"Entertainment", sm:1, items:["Twist Sport","Twist TV","Twist Music","e& Egypt News"]},
    {t:"Shop", href:"#shop", h:"e‑Shop", sm:1, items:["Homepage","TVs","Mobile phones","Laptops","Tablets","Internet devices"]}
  ],
  slides:[
    {title:"No Excuses", text:"", img:IMG.summer, noBtn:1},
    {title:"e& money", text:"cashback is your reward & get a chance to win 100,000LE.", img:IMG.money},
    {title:"Emerald", text:"What is Life without Living?", img:IMG.emerald},
    {title:"حكاية بقت حكايتين", text:"حكاية ميكسات و حكاية انترنت<br>كل حكاية بتكمل بحكاية", img:IMG.hekaya, ar:true, noBtn:1, icons:1},
    {title:"eSIM", text:"eSIM is an embedded SIM, enabling you to activate your line without the need for a physical SIM card", img:IMG.esim}
  ],
  quick:["eHome DSL","More Program","Dial Reservation","Track Order"],
  plans:[
    {name:"Emerald", price:460, img:IMG.p1, desc:"Welcome to the realm of exclusive privileges where we will provide you with a vast spectrum of our telecom services & connectivity, with plush benefits that would take your travel and business experiences to a whole new level."},
    {name:"Hekaya Mixat", price:52, img:IMG.p2, desc:"Stay in control & Migrate to New Hekaya Mixat Bundles; the largest bundles in Egypt"},
    {name:"Hekaya Internet", price:46, img:IMG.p3, desc:"Now with Hekaya Internet get up to 50,000 megabytes & choose up to 3 of your favorite apps to enjoy for Up to 1 GB"},
    {name:"Akwa Kart", price:5, img:IMG.p4, desc:"Recharge Akwa Kart in 7 different methods with the value and validity of your choice."}
  ],
  askAbout:n=>`Tell me about ${n}`,
  read:[
    {img:IMG.net, t:"Switch To e& Egypt", p:"Now you can submit a request to switch your current number to <b>e& Egypt</b> or you can request a call from customer service to assist you with the transfer. You can also follow up on your submitted request and know all the details of the request."},
    {img:IMG.trav, t:"HI traveler", p:"Now <b>e& Egypt</b> offers you Hi traveler line that allows you to enjoy a variety of packages to meet your Internet, calls and international calls needs at the best prices and highest speed."}
  ],
  svc:[
    {t:"e& Egypt Directory", p:"Inquire about phone numbers and locations of anyplace and you can even book your cinema tickets."},
    {t:"e& money", wide:1, img:IMG.emoney, p:"Transfer money from your mobile to any other mobile number or wallet in Egypt even if it is not e& money wallet. You can cash in/out from the nearest <b>e& Egypt</b> store, From Fawry stores or POS & also you can cash in or out from banks ATMs."},
    {t:"Ro2ya", p:"A list of Deaf and Mute Bundles"},
    {t:"Call Filter (Nas W Nas)", p:"Have 'peace of mind' by controling and managing your incoming calls. Remain reachable to those whom you want to connect with, also make yourself unavailable from undesired calls."},
    {t:"Super sallefny", p:"Out of credit? No problem. With super sallefny, your “running tab” service, make your urgent calls and browse the internet without credit internet and more services even if you are out of credit."}
  ],
  eshopTitle:"Explore our latest products", eshopText:"With In The Best Prices From <b>e& Egypt</b> .", shopNow:"Shop Now",
  app:"My e& Egypt App",
  footer:[{h:"Get To Know Us", items:["About Us","Sustainability","Careers","Rights & Duties","Contracts","Supplier's COC English"]},{h:"Looking for more ?", items:["Emerald","Hekaya Internet","Hekaya Mixat","El Kart Prepaid","Data Line","eHome DSL"]}],
  copyright:"Copyright © 1998-2021 e& misr company, All Rights Reserved", privacy:"Privacy Policy", terms:"Terms & Conditions", follow:"Follow Us",
  /* chat */
  botName:"e& Assistant", status:"Online · replies instantly",
  noMatch:"I couldn’t find reliable information about that in the available e& product guides. Try rephrasing your question or ask about data plans, internet packages, prepaid options, Emerald, or Hekaya.",
  sources:"Sources", page:"page", retry:"Try again",
  hint:"Need help choosing a plan? 👋", placeholder:"Ask about plans, bundles, recharge…",
  chatNote:"AI assistant · never share your password or card details in chat",
  welcome:"Hi! I'm the **e& Egypt** assistant 👋\nI can help you compare plans, find the right bundle, or explain recharge options. What are you looking for?",
  suggestions:["Compare your plans","Cheapest internet bundle","What is Emerald?","How do I recharge Akwa Kart?"],
  error:"Sorry, I'm having trouble connecting right now. Please try again in a moment, or visit your nearest e& Egypt store.",
  empty:"Sorry, I didn't get a response. Please try again.",
  aOpen:"Chat with e& assistant", aReset:"New conversation", aClose:"Close chat", aSend:"Send", aMsg:"Message",
  dataLine:{name:"Data Line", price:46},
  pdf:{open:n=>`Open ${n} details (PDF)`, sub:"Plan details · PDF", download:"Download", ask:"Ask the assistant", close:"Close",
       loading:"Loading plan details…", missing:"Detailed information for this plan will be available soon.", failed:"Couldn't display the PDF here.", pages:n=>`${n} page${n>1?"s":""}`, zoomIn:"Zoom in", zoomOut:"Zoom out"}
},
ar:{
  langLabel:"English", langLabelClass:"en-font", consumer:"شخصي", business:"شركات", stores:"الفروع", signin:"تسجيل الدخول",
  details:"التفاصيل", knowMore:"اعرف المزيد", knowMoreArrow:"اعرف المزيد ↖", from:"تبدأ من", perMonth:"جنيه/شهر",
  titles:{plans:["انظمة","إي آند مصر"], read:["اعرف","عن"], svc:["اكتشف","خدماتنا"], ent:["الركن","الترفيهي"]},
  nav:[
    {t:"خطط الاسعار", href:"#plans", h:"خطط الاسعار", items:["اميرالد","اميرالد GTO","انظمه more","حكاية ميكسات","حكاية انترنت","بريمو","سوبر كونكت (شهرية)","سوبر ساعات","انترنت ميجابايتس","خط الداتا","حول شبكتك 5G","أقوي كارت","عجلة الحظ","اقوي كارت شحن","اهلا اليومية","منيو الجنيه","رؤية","برنامج الكوينز"]},
    {t:"eHome", href:"#"},
    {t:"خدمات", href:"#services", h:"خدمات", items:["e& money","خدمات المعاش","إعادة الشحن المدفوعة مسبقًا","الدفع عبر الانترنت","تحويل الأموال الدولية","كول كيبر","مكالمة الفيديو","البريد الصوتى","رسائل الملتيميديا","الكول فلتر (ناس وناس)","مكالمات wi-fi","eSIM","اختار رقمك","خدمة خطين","حول لإي آند مصر","تحويل الرصيد","سوبر سلفني","رصيدى","السفر الى مصر","السفر الى الخارج","مكالمات دولية","خدمة التتبع","دليل 7070"]},
    {t:"الركن الترفيهي", href:"#entertainment", h:"الركن الترفيهي", sm:1, items:["تويست سبورتس","تويست tv","تويست ميوزيك","إي آند مصر نيوز"]},
    {t:"تسوق", href:"#shop", h:"تسوق", sm:1, items:["الصفحة الرئيسية","تلفيزيونات","الهواتف","لابتوبات","تابليتس","أجهزة انترنت","إكسسوارات","ألعاب"]}
  ],
  slides:[
    {title:"مالكش حجة", text:"", img:IMG.summer, noBtn:1},
    {title:'انت كدة كدة كسبان مع<span class="en-font">e& money</span>', text:"اكسب كاش باك و سحب اسبوعى على 100,000 جنيه", img:IMG.money},
    {title:"اميرالد", text:"وسط ما انت عايش ماتنساش تعيش", img:IMG.emerald},
    {title:"حكاية بقت حكايتين", text:"حكاية ميكسات و حكاية انترنت<br>كل حكاية بتكمل بحكاية", img:IMG.hekaya, noBtn:1, icons:1},
    {title:"eSIM", text:"هي عبارة عن شريحة الكترونيه داخل جهازك تمكنك من تفعيل خطك دون الحاجة للشريحة التقليدية", img:IMG.esim}
  ],
  quick:["eHome DSL","برنامج More","اختار رقمك","تتبع طلبك"],
  plans:[
    {name:"اميرالد", price:460, img:IMG.p1, desc:"أهلًا بك في عالم مميز جدًا من أرقى خدمات إي آند مصر المختلفة، ومزايا رائعة لضمان مستوى خاص لأعمالك وسفرك."},
    {name:"حكاية ميكسات", price:52, img:IMG.p2, desc:"خليك مسيطر مع حكاية ميكسات، اكبر باقة وحدات في مصر! دلوقتي كبرنالك الباقة و زودنالك الميكسات و بنفس السعر."},
    {name:"حكاية انترنت", price:46, img:IMG.p3, desc:"دلوقتي مع حكاية انترنت عندك باقات انترنت لحد 50 الف ميجابايتس و كمان تقدر تختار لحد 3 تطبيقات تقدر تستخدمهم براحتك طول الشهر بحد أقصي 1 جيجا"},
    {name:"أقوي كارت", price:5, img:IMG.p4, desc:"اقوى كارت في حتة لوحده، علشان اقوى كارت الوحيد اللي تقدر تشحنه ب 7 طرق مختلفة و بالقيمة و الصلاحية اللي انت عايزها."}
  ],
  askAbout:n=>`عايز أعرف عن ${n}`,
  read:[
    {img:IMG.net, t:"حول لشبكة إي آند مصر", p:"الآن يمكنك الانضمام إلى أفضل شبكة بنفس رقمك! قم بتغيير شبكة المحمول الخاصة بك مع الاحتفاظ برقم هاتفك المحمول"},
    {img:IMG.trav, t:'نظام <span class="en-font">HI Traveler</span>', p:"الذي يتيح لك الاستمتاع بباقات متنوعه لتلبي احتياجك من الانترنت و المكالمات الدوليه و المحليه بافضل الاسعار"}
  ],
  svc:[
    {t:"الدليل الشخصي", p:"الان عن طريق الاتصال ب 7070 يمكنك ان تعرف ارقام و عناوين اي مكان في مصر و ايضا حجز تذاكر السينما"},
    {t:'<span class="en-font">e& money</span>', wide:1, img:IMG.emoney, p:"بإمكانك تحويل النقود في الحال عن طريق الموبايل لأي رقم في مصر ولأى محفظة في مصر، من خلال e& money سدد فاتورتك او اشحن رصيد ليك و لغيرك و الشراء عبر الانترنت عن طريق بطاقة كاش (VCN) الائتمانية بدون قلق من سرقة بيانات كارتك الائتماني"},
    {t:"رؤية", p:"باقات مخصصة للصم و البكم"},
    {t:"الكول فلتر (ناس وناس)", p:"خدمة الكول فلتر (ناس و ناس) من إي آند مصر تمنحك القدرة على التحكم و ادارة المكالمات الواردة فبإمكانك الأن ان تكون متاح لكل من تريد التواصل معه أو ان تكون غير متاح لغير المرغوب فيهم من المتصلين"},
    {t:"سوبر سلفني", p:"تقدر تعمل مكالماتك وتصفّح الانترنت والمزيد حتى لو رصيدك تم"}
  ],
  eshopTitle:"استكشف أحدث منتجاتنا", eshopText:"بأفضل الأسعار من <b>إي آند مصر</b>.", shopNow:"تسوق الان",
  app:"تطبيق ماي إي آند مصر",
  footer:[{h:"إي آند مصر", items:["عن إي آند مصر","الأستدامة","وظائف","حقوقك و واجباتك","عقود","مدونة السلوك لموردي إي آند"]},{h:"اعرف المزيد عن", items:["اميرالد","حكاية انترنت","حكاية ميكسات","أقوي كارت","خط الداتا","eHome DSL"]}],
  copyright:"حقوق الملكية © 1998-2021 إي آند مصر. جميع الحقوق محفوظة.", privacy:"سياسة الحفاظ على الخصوصية", terms:"الشروط و الأحكام", follow:"تابعنا",
  /* chat */
  botName:"مساعد إي آند", status:"متاح الآن · بيرد فورًا",
  noMatch:"مقدرناش نلاقي معلومة موثوقة عن ده في أدلة منتجات إي آند المتاحة. جرب تسأل بطريقة تانية أو اسأل عن باقات الانترنت، الكارت، اميرالد، أو حكاية.",
  sources:"المصادر", page:"صفحة", retry:"جرب تاني",
  hint:"محتاج مساعدة تختار باقتك؟ 👋", placeholder:"اسأل عن الباقات، الشحن، الخدمات…",
  chatNote:"مساعد ذكي · متشاركش كلمة السر أو بيانات الكارت في الشات",
  welcome:"أهلاً بيك! أنا مساعد **إي آند مصر** 👋\nأقدر أساعدك تقارن بين الباقات، تختار الباقة المناسبة ليك، أو أشرحلك طرق الشحن. محتاج إيه؟",
  suggestions:["قارن بين الباقات","أرخص باقة انترنت","يعني إيه اميرالد؟","إزاي أشحن أقوى كارت؟"],
  error:"آسفين، فيه مشكلة في الاتصال دلوقتي. جرب تاني بعد شوية، أو زور أقرب فرع لإي آند مصر.",
  empty:"آسفين، مفيش رد. جرب تاني من فضلك.",
  aOpen:"كلم مساعد إي آند", aReset:"محادثة جديدة", aClose:"اقفل الشات", aSend:"إرسال", aMsg:"رسالتك",
  dataLine:{name:"خط الداتا", price:46},
  pdf:{open:n=>`اعرض تفاصيل ${n} (PDF)`, sub:"تفاصيل الباقة · PDF", download:"تحميل", ask:"اسأل المساعد", close:"إغلاق",
       loading:"جاري تحميل تفاصيل الباقة…", missing:"تفاصيل الباقة دي هتكون متاحة قريبًا.", failed:"مقدرناش نعرض الملف هنا.", pages:n=>n==1?"صفحة واحدة":n==2?"صفحتين":`${Number(n).toLocaleString("ar-EG")} ${n<11?"صفحات":"صفحة"}`, zoomIn:"تكبير", zoomOut:"تصغير"}
}};

/* Plan PDFs — index: 0 Emerald, 1 Hekaya Mixat, 2 Hekaya Internet, 3 Prepaid systems (Akwa Kart), 4 Data Line. */
export const PLAN_FILES = ["emerald", "hekaya-mixat", "hekaya-internet", "prepaid-systems", "data-line"];
export const planPdf = (i, lang) => `/pdfs/${lang}/${PLAN_FILES[i]}.pdf`;

// menu / footer labels that open a plan PDF
const PDF_LINKS = {
  "emerald":0, "hekaya mixat":1, "hekaya internet":2, "akwa kart":3, "el kart prepaid":3, "data line":4,
  "hekayamixat":1, "hekayainternet":2, "prepaidsystems":3, "dataline":4,
  "اميرالد":0, "حكاية ميكسات":1, "حكاية انترنت":2, "أقوي كارت":3, "خط الداتا":4
};
export const pdfIndexOf = (label) => PDF_LINKS[String(label).trim().replace(/\.pdf$/i, "").toLowerCase()];
export function sourcePdfTarget(source) {
  const index = pdfIndexOf(source.title);
  if (index === undefined) return null;
  const page = Number(source.page);
  return { index, page: Number.isInteger(page) && page > 0 ? page : 1 };
}
