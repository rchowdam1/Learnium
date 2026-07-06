from pathlib import Path
import runpy


REAL_HOOK = Path(__file__).resolve().parent / ".bmad-loop" / "bmad_loop_hook.py"

runpy.run_path(str(REAL_HOOK), run_name="__main__")
