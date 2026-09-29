#!/usr/bin/env python3
"""Sync the canonical TJM UI snapshots to every configured independent case study."""
from pathlib import Path
import argparse,json,re,subprocess,sys
parser=argparse.ArgumentParser()
parser.add_argument('--check',action='store_true')
args=parser.parse_args()
center=Path(__file__).resolve().parents[1]
workspace=center.parent
skill=workspace/'skills/tjm-web-skill'
subprocess.run([sys.executable,str(skill/'scripts/sync_from_center.py'),'--center',str(center)]+(['--check'] if args.check else []),check=True)
routes=json.loads((skill/'references/deployment-urls.json').read_text())
snapshot=skill/'assets/center-source'
files={'css/portfolio-motion.css':'portfolio-motion.css','js/portfolio-motion.js':'portfolio-motion.js','js/shared-sidebar.js':'shared-sidebar.js','css/shared-sidebar.css':'shared-sidebar.css','js/front.js':'front.js','css/custom.css':'center-shell.css'}
changed=[]
for route in routes['workDetails']:
 folder=workspace/'JiangmingTian_Portfolio_Detail_Pages'/route['repository']
 if not (folder/'index.html').exists(): raise SystemExit('Missing mapped case study: '+str(folder))
 for src,dst in files.items():
  wanted=(snapshot/src).read_bytes(); dest=folder/dst
  if not dest.exists() or dest.read_bytes()!=wanted:
   changed.append(str(dest.relative_to(workspace)))
   if not args.check: dest.write_bytes(wanted)
if args.check and changed: raise SystemExit('Stale detail UI files: '+', '.join(changed))
print(('Checked' if args.check else 'Synchronized')+f' {len(routes["workDetails"])} detail sites; {len(files)} canonical assets each.')
