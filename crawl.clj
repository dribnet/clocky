#!/usr/bin/env lein2 exec

(ns shell.crawl)

; (defn frm-save
;  "Save a clojure form to file."
;   [#^java.io.File file form]
;   (with-open [w (java.io.FileWriter. file)] 
;     (binding [*out* w *print-dup* true] (prn frm))))

(def namespaces (map ns-name (all-ns)))

(defn pair [s]
  [s (map first (ns-publics (symbol s)))])

(def nametree (reduce conj {} (map pair namespaces)))

(prn nametree)