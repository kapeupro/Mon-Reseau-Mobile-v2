import json
import os
import subprocess  # noqa: S404 - subprocess utilisé de manière sécurisée (shell=False + whitelist)


def execcmd(cmd: list, is_needed_result=False, is_with_timeout=False):
    if not cmd or not isinstance(cmd, list):
        raise ValueError("cmd doit être une liste non vide")

    cmd_to_exec = cmd[0]
    options = cmd[1:]

    if not os.path.isfile(cmd_to_exec) and cmd_to_exec not in ("curl", "ogr2ogr"):
        raise ValueError(f"Exécutable introuvable : {cmd_to_exec}")

    if not all(isinstance(opt, str) for opt in options):
        raise TypeError("Toutes les options doivent être des chaînes de caractères")

    timeout = 10 if is_with_timeout else None

    try:
        result = subprocess.run([cmd_to_exec] + options, check=True, capture_output=True, timeout=timeout, shell=False)  # noqa: S603

        return True if not is_needed_result else result
    except json.JSONDecodeError:
        return False
    except subprocess.CalledProcessError:
        return False
    except subprocess.TimeoutExpired:
        return False
    except OSError:
        return False
