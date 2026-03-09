import * as path from 'path';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class AiService {
  async runPrediction(inputData: {
    job_post_texts: string[];
    resumes_texts: string[];
  }): Promise<any> {
    const scriptPath = path.join(process.cwd(), 'src/ai/model/similarity.py');

    // Convert input data to a string argument for the Python script
    const inputArg = JSON.stringify(inputData);

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(
        'e:\\masters-classes\\dcc-classes\\cloud-based-ai-resume-screening\\.venv\\Scripts\\python.exe',
        [scriptPath, inputArg],
      );

      let output = '';
      let error = '';

      // Collect data from the Python script's stdout
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      // Collect errors from the Python script's stderr
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(
            `Python script exited with code ${code}. Error: ${error}`,
          );
          return reject(
            new InternalServerErrorException('AI prediction failed.'),
          );
        }

        try {
          // Assuming the Python script prints JSON to stdout
          resolve(JSON.parse(output));
        } catch (e) {
          console.error('Failed to parse Python output:', output);
          reject(new InternalServerErrorException('Invalid AI output format.'));
        }
      });
    });
  }
}
