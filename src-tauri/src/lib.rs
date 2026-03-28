use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct RoundRecord {
    pub round: u32,
    #[serde(rename = "damageByPlayer")]
    pub damage_by_player: HashMap<String, u32>,
}

#[tauri::command]
async fn export_combat_csv(
    app: tauri::AppHandle,
    session_id: String,
    player_ids: Vec<String>,
    player_names: Vec<String>,
    round_records: Vec<RoundRecord>,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    // Build CSV content
    let mut csv = String::new();

    // Header row
    csv.push_str("Round");
    for name in &player_names {
        csv.push(',');
        // Escape commas in player names
        if name.contains(',') {
            csv.push('"');
            csv.push_str(name);
            csv.push('"');
        } else {
            csv.push_str(name);
        }
    }
    csv.push_str(",Total\n");

    // Data rows
    for rec in &round_records {
        csv.push_str(&rec.round.to_string());
        let mut row_total: u32 = 0;
        for pid in &player_ids {
            let dmg = rec.damage_by_player.get(pid).copied().unwrap_or(0);
            row_total += dmg;
            csv.push(',');
            csv.push_str(&dmg.to_string());
        }
        csv.push(',');
        csv.push_str(&row_total.to_string());
        csv.push('\n');
    }

    // Show native save dialog
    let file_path = app
        .dialog()
        .file()
        .set_title("Save Combat DPR Report")
        .set_file_name(&format!("monster-math-combat-{}.csv", &session_id[..8]))
        .add_filter("CSV Files", &["csv"])
        .blocking_save_file();

    match file_path {
        Some(path) => {
            let path_str = path.to_string();
            std::fs::write(&path_str, csv.as_bytes())
                .map_err(|e| format!("Failed to write file: {}", e))?;
            Ok(path_str)
        }
        None => Err("Save cancelled".to_string()),
    }
}

#[tauri::command]
async fn save_combat_state(app: tauri::AppHandle, json: String, file_name: String) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .set_title("Save Combat State")
        .set_file_name(&file_name)
        .add_filter("Monster Math Save", &["json"])
        .blocking_save_file();

    match file_path {
        Some(path) => {
            let path_str = path.to_string();
            std::fs::write(&path_str, json.as_bytes())
                .map_err(|e| format!("Failed to write file: {}", e))?;
            Ok(path_str)
        }
        None => Err("Save cancelled".to_string()),
    }
}

#[tauri::command]
async fn load_combat_state(app: tauri::AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .set_title("Load Combat State")
        .add_filter("Monster Math Save", &["json"])
        .blocking_pick_file();

    match file_path {
        Some(path) => {
            let path_str = path.to_string();
            std::fs::read_to_string(&path_str)
                .map_err(|e| format!("Failed to read file: {}", e))
        }
        None => Err("Load cancelled".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            export_combat_csv,
            save_combat_state,
            load_combat_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
