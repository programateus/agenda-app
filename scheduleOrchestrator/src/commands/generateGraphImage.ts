import { graph } from "@src/assistant/assistantGraph";
import { writeFile } from "fs/promises";
import path from "path";

async function generateGraphImage() {
  var compiledGraph = await graph.getGraphAsync();
  var buffer = await compiledGraph.drawMermaidPng();
  await writeFile(
    path.resolve(import.meta.dirname, "../../graph-flow.png"),
    buffer.stream(),
  );
}

generateGraphImage();
