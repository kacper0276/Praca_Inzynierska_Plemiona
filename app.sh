#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

hide_cursor() {
    tput civis
}

show_cursor() {
    tput cnorm
}

show_main_menu() {
    hide_cursor
    options=("Pull repo" "Uruchom Dev" "Buduj Kontenery" "Wyjdź")
    current_selection=0

    while true; do
        clear
        echo -e "${GREEN}Wybierz opcję:${NC}"

        for i in "${!options[@]}"; do
            if [[ $i -eq $current_selection ]]; then
                echo -e " ${RED}->$NC ${options[$i]}"
            else
                echo "   ${options[$i]}"
            fi
        done

        read -s -n 3 key

        case "$key" in
            $'\x1b[A')
                current_selection=$((current_selection - 1))
                if [[ $current_selection -lt 0 ]]; then
                    current_selection=$((${#options[@]} - 1))
                fi
                ;;
            $'\x1b[B')
                current_selection=$((current_selection + 1))
                if [[ $current_selection -ge ${#options[@]} ]]; then
                    current_selection=0
                fi
                ;;
            "")
                execute_main_option "${options[$current_selection]}"
                if [[ "${options[$current_selection]}" == "Wyjdź" ]]; then
                    break
                fi
                ;;
            *)
                ;;
        esac
    done
    show_cursor
}

show_dev_menu() {
    dev_options=("Backend" "Frontend" "Backend i Frontend" "Powrót")
    dev_current_selection=0

    while true; do
        clear
        echo -e "${GREEN}Wybierz co uruchomić w trybie Dev:${NC}"

        for i in "${!dev_options[@]}"; do
            if [[ $i -eq $dev_current_selection ]]; then
                echo -e " ${RED}->$NC ${dev_options[$i]}"
            else
                echo "   ${dev_options[$i]}"
            fi
        done

        read -s -n 3 key

        case "$key" in
            $'\x1b[A')
                dev_current_selection=$((dev_current_selection - 1))
                if [[ $dev_current_selection -lt 0 ]]; then
                    dev_current_selection=$((${#dev_options[@]} - 1))
                fi
                ;;
            $'\x1b[B')
                dev_current_selection=$((dev_current_selection + 1))
                if [[ $dev_current_selection -ge ${#dev_options[@]} ]]; then
                    dev_current_selection=0
                fi
                ;;
            "")
                execute_dev_option "${dev_options[$dev_current_selection]}"
                if [[ "${dev_options[$dev_current_selection]}" == "Powrót" ]]; then
                    break
                fi
                ;;
            *)
                ;;
        esac
    done
}

execute_main_option() {
    case "$1" in
        "Pull repo")
            clear
            echo -e "${GREEN}Wybrano: Pull repo...${NC}"
            sleep 2
            echo -e "${GREEN}Pull zakończony.${NC}"
            read -p "Naciśnij Enter, aby kontynuować..."
            ;;
        "Uruchom Dev")
            show_dev_menu
            ;;
        "Buduj Kontenery")
            clear
            echo -e "${GREEN}Wybrano: Buduj Kontenery...${NC}"
            sleep 2
            echo -e "${GREEN}Budowanie kontenerów zakończone.${NC}"
            read -p "Naciśnij Enter, aby kontynuować..."
            ;;
        "Wyjdź")
            clear
            echo -e "${GREEN}Wychodzenie z programu.${NC}"
            exit 0
            ;;
    esac
}

execute_dev_option() {
    case "$1" in
        "Backend")
            clear
            echo -e "${GREEN}Uruchamiam Dev: Backend...${NC}"
            cd backend && yarn start:dev
            echo -e "${GREEN}Backend uruchomiony.${NC}"
            read -p "Naciśnij Enter, aby kontynuować..."
            ;;
        "Frontend")
            clear
            echo -e "${GREEN}Uruchamiam Dev: Frontend...${NC}"
            cd client && npm run start:dev
            echo -e "${GREEN}Frontend uruchomiony.${NC}"
            read -p "Naciśnij Enter, aby kontynuować..."
            ;;
        "Backend i Frontend")
            clear
            echo -e "${GREEN}Uruchamiam Dev: Backend i Frontend...${NC}"
            (cd backend && yarn start:dev) &
            (cd client && npm run start:dev) 
            echo -e "${GREEN}Backend i Frontend uruchomione.${NC}"
            read -p "Naciśnij Enter, aby kontynuować..."
            ;;
        "Powrót")
            ;;
    esac
}

show_main_menu
