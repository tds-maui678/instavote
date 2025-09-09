export const auth = {
    get token() { return localStorage.getItem("token") || ""; },
    set token(v) { v ? localStorage.setItem("token", v) : localStorage.removeItem("token"); },
    get user()  { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; },
    set user(u) { u ? localStorage.setItem("user", JSON.stringify(u)) : localStorage.removeItem("user"); }
  };
  
 
  export function getAnonId() {
    let id = localStorage.getItem("anonId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("anonId", id);
    }
    return id;
  }
  