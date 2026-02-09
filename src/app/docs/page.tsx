// 'use client'

// import SwaggerUI from 'swagger-ui-react'
// import 'swagger-ui-react/swagger-ui.css'

// export default function SwaggerDocsPage() {
//   return (
//     <div style={{ height: '100vh' }}>
//       <SwaggerUI url="/api/docs" />
//     </div>
//   )
// }

import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger"

export default async function IndexPage(){
  const spec = await getApiDocs();
  return <section className="contenaire">
      <ReactSwagger spec={spec} />
  </section>
  

}