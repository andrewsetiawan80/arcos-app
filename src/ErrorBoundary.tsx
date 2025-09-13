import React from "react";

type S = { hasError: boolean; info?: string };
export default class ErrorBoundary extends React.Component<React.PropsWithChildren, S> {
  state: S = { hasError: false };
  static getDerivedStateFromError(err: any){ return { hasError: true, info: String(err) }; }
  componentDidCatch(err:any, info:any){ console.error("App error:", err, info); }
  render(){
    if (this.state.hasError){
      return (
        <div style={{padding:20,fontFamily:"ui-sans-serif"}}>
          <h1>Something broke</h1>
          <p>Open DevTools Console for details.</p>
          <pre style={{whiteSpace:"pre-wrap",opacity:.7}}>{this.state.info}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
