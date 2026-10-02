const fs = require('fs');
let txt = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr1 = `          <SettingsProvider>
            <Router>
              <ScrollToTop />
              <Suspense fallback={<div className="flex h-[50vh] w-full items-center justify-center text-slate-500">Loading...</div>}>`;

const targetStr2 = `              </Routes>
              </Suspense>
            </Router>
          </SettingsProvider>`;

txt = txt.replace(/<<<<<<< Updated upstream[\s\S]*?=======\r?\n[\s\S]*?>>>>>>> Stashed changes\r?\n/, targetStr1 + '\n');
txt = txt.replace(/<<<<<<< Updated upstream[\s\S]*?=======\r?\n[\s\S]*?>>>>>>> Stashed changes\r?\n/, targetStr2 + '\n');

fs.writeFileSync('src/App.jsx', txt);
