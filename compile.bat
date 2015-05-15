dir *.ts /b /s > ts-files.txt
tsc @ts-files.txt
del ts-files.txt