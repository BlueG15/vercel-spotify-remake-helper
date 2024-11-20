const fs = require("fs");

const entityID = {
  dom: "'<-main_body->'",
  idArr: "'<-id_array->'",
  header: '<div class="mc" id="{cc}">',
};

const template = fs.readFileSync("./template.html", { encoding: "utf-8" });

function reloadData() {
  const files = fs.readdirSync("./src").filter((a) => a.endsWith(".html"));
  // console.log(files);

  const comp = [];
  const ele = [];

  for (let i = 0; i < files.length; i++) {
    const fileName = "./src/" + files[i];
    const file = fs.readFileSync(fileName, { encoding: "utf-8" });

    const stage_1 = file.trim();
    if (!stage_1.startsWith(entityID.header)) {
      continue;
    }

    const id = files[i].split(".")[0];

    const stage_2 = file.replace(
      entityID.header,
      `<div class="mc" id="${id}">`
    );

    comp.push(stage_2);
    ele.push(id);

    console.log(`Added [${files[i]}] to index.html`);
  }

  const final_1 = template.replace(entityID.dom, comp.join("\n"));
  const final = final_1.replace(entityID.idArr, JSON.stringify(ele));

  fs.writeFileSync("./index.html", final);
  console.log(`Complete!`);
}

reloadData();

let fsTimeout = null;
fs.watch("./src", (eventType) => {
  if (!fsTimeout) {
    console.log(`${eventType} Changes detected, reloading`);
    reloadData();
    fsTimeout = setTimeout(() => (fsTimeout = null), 1000);
  }
});
